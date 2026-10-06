import * as machineService from "../services/machine.service.js";

export async function listMachines(_req, res) {
  res.json(await machineService.listMachines());
}

export async function getMachine(req, res) {
  res.json(await machineService.getMachine(req.valid.params.assetCode));
}

export async function getMachineShifts(req, res) {
  const { assetCode } = req.valid.params;
  const { limit } = req.valid.query;
  res.json(await machineService.getMachineShifts(assetCode, limit));
}

export async function getMachineScopes(req, res) {
  res.json(await machineService.getMachineScopes(req.valid.params.assetCode));
}
