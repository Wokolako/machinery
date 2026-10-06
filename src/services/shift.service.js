import { NotFoundError } from "../errors/AppError.js";
import * as flagRepo from "../repositories/flag.repository.js";
import * as gradeRepo from "../repositories/grade.repository.js";
import * as logRepo from "../repositories/log.repository.js";
import * as scopeRepo from "../repositories/scope.repository.js";
import { computeShiftMetrics, toKg, toMajor } from "./calculation.service.js";
import { getMachine, shapeOutputs } from "./machine.service.js";

const DEMO_FLAGS = ["below_band", "above_band", "grade_drift"];

/**
 * Everything the website's live shift record needs: the machine's latest
 * locked scope, the shift close logged against it, grade prices, the 30-day
 * premium-share mean and the wording of each flag the browser can raise.
 */
export async function getDemoShift(assetCode) {
  const machine = await getMachine(assetCode);

  const scope = await scopeRepo.findLatestLocked(machine.id);
  if (!scope) throw new NotFoundError(`No locked scope for machine ${assetCode}.`);

  const log = await logRepo.findCurrentShiftClose(scope.id);
  if (!log) throw new NotFoundError(`No shift close logged against scope ${scope.id}.`);

  const [grades, history, flagRows] = await Promise.all([
    gradeRepo.findByCompany(machine.companyId),
    logRepo.findPremiumShareHistory(machine.id, scope.periodStart),
    flagRepo.findByCodes(DEMO_FLAGS),
  ]);

  const price = Object.fromEntries(grades.map((g) => [g.code, toMajor(g.priceMinorPerKg)]));
  const outputs = shapeOutputs(log.outputs);
  const inputKg = toKg(log.inputQty, log.inputUnit);
  const inputValue = toMajor(scope.plannedInputValueMinor);
  const meanPremiumShare = history?.meanShare ?? 0;

  const metrics = computeShiftMetrics({
    inputKg,
    inputValue,
    bandLow: scope.bandLow,
    bandHigh: scope.bandHigh,
    hoursRun: log.hoursRun,
    wasteKg: log.wasteKg,
    outputs,
    meanPremiumShare,
  });

  return {
    machine: { assetCode: machine.assetCode, name: machine.name },
    shiftLabel: scope.shiftLabel,
    scopeVersion: scope.version,
    lockedAt: scope.lockedLocal,
    material: scope.material,
    destination: scope.destination,
    inputKg,
    inputValue,
    bandLow: scope.bandLow,
    bandHigh: scope.bandHigh,
    plannedHours: scope.plannedHours,
    shift: {
      logId: log.id,
      hoursRun: log.hoursRun,
      wasteKg: log.wasteKg,
      goodKg: metrics.goodKg,
      premiumKg: metrics.premiumKg,
    },
    prices: { premium: price.premium ?? 0, commercial: price.commercial ?? 0 },
    meanPremiumShare,
    historyShifts: history?.shifts ?? 0,
    metrics,
    flagText: Object.fromEntries(flagRows.map((f) => [f.code, `${f.raisedWhen} ${f.effect}`])),
  };
}
