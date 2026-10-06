import * as ledgerService from "../services/ledger.service.js";
import * as shiftService from "../services/shift.service.js";

export async function getDemoShift(req, res) {
  res.json(await shiftService.getDemoShift(req.valid.query.machine));
}

export async function getLedgerExample(_req, res) {
  res.json(await ledgerService.getLatestCorrection());
}
