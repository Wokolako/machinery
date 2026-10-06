import { NotFoundError } from "../errors/AppError.js";
import * as logRepo from "../repositories/log.repository.js";
import * as machineRepo from "../repositories/machine.repository.js";
import * as scopeRepo from "../repositories/scope.repository.js";
import { computeShiftMetrics, toKg, toMajor } from "./calculation.service.js";

export function listMachines() {
  return machineRepo.findAll();
}

export async function getMachine(assetCode) {
  const machine = await machineRepo.findByAssetCode(assetCode);
  if (!machine) throw new NotFoundError(`No machine with asset code ${assetCode}.`);
  return machine;
}

export function shapeOutputs(outputs) {
  return outputs.map((o) => ({
    gradeCode: o.gradeCode,
    grade: o.grade,
    kind: o.kind,
    qtyKg: o.qtyKg,
    pricePerKg: toMajor(o.priceMinorPerKg),
  }));
}

/** Recent shift closes on a machine, each with its calculated metrics and flags. */
export async function getMachineShifts(assetCode, limit) {
  const machine = await getMachine(assetCode);
  const logs = await logRepo.findShiftCloses(machine.id, limit);

  return logs.map((log) => {
    const outputs = shapeOutputs(log.outputs);
    const inputValue =
      log.plannedInputValueMinor === null ? null : toMajor(log.plannedInputValueMinor);
    return {
      logId: log.id,
      scopeId: log.scopeId,
      periodStart: log.periodStart,
      periodEnd: log.periodEnd,
      hoursRun: log.hoursRun,
      inputKg: toKg(log.inputQty, log.inputUnit),
      wasteKg: log.wasteKg,
      outputs,
      metrics: computeShiftMetrics({
        inputKg: toKg(log.inputQty, log.inputUnit),
        inputValue,
        bandLow: log.bandLow,
        bandHigh: log.bandHigh,
        hoursRun: log.hoursRun,
        wasteKg: log.wasteKg,
        outputs,
        scoped: log.scopeId !== null,
      }),
    };
  });
}

/** Every scope version for a machine, so revisions can be compared. */
export async function getMachineScopes(assetCode) {
  const machine = await getMachine(assetCode);
  const scopes = await scopeRepo.findAllVersions(machine.id);
  return scopes.map(({ plannedInputValueMinor, ...s }) => ({
    ...s,
    plannedInputValue: plannedInputValueMinor === null ? null : toMajor(plannedInputValueMinor),
  }));
}
