import * as healthService from "../services/health.service.js";

export async function getHealth(_req, res) {
  const health = await healthService.check();
  res.status(health.ok ? 200 : 503).json(health);
}
