import { NotFoundError } from "../errors/AppError.js";
import * as logRepo from "../repositories/log.repository.js";

const shape = (row) => ({
  id: row.id,
  supersedes: row.supersedes,
  reason: row.reason,
  inputQty: row.inputQty,
  inputUnit: row.inputUnit,
  prevHash: row.prevHash,
  eventHash: row.eventHash,
  assetCode: row.assetCode,
  from: row.from,
  to: row.to,
  outputs: row.outputs.map((o) => ({ grade: o.grade, qtyKg: o.qtyKg })),
});

/** The latest correction: the original log and the one that replaced it. */
export async function getLatestCorrection() {
  const rows = await logRepo.findLatestCorrectionPair();
  if (rows.length < 2) throw new NotFoundError("No corrections recorded yet.");
  const [original, replacement] = rows.map(shape);
  return { original, replacement };
}
