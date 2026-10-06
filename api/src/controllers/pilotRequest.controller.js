import * as pilotService from "../services/pilotRequest.service.js";

export async function createPilotRequest(req, res) {
  const created = await pilotService.createPilotRequest(req.valid.body);
  res.status(201).location(`/api/pilot-requests/${created.id}`).json(created);
}

export async function listPilotRequests(req, res) {
  res.json(await pilotService.listPilotRequests(req.valid.query));
}

export async function getPilotRequest(req, res) {
  res.json(await pilotService.getPilotRequest(req.valid.params.id));
}
