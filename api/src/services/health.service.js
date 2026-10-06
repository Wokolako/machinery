import * as healthRepo from "../repositories/health.repository.js";

const startedAt = new Date();

/** Never throws: reports the database as down instead. */
export async function check() {
  const base = {
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
  };
  try {
    const db = await healthRepo.ping();
    return { ok: true, ...base, database: { ok: true, ...db } };
  } catch (err) {
    return { ok: false, ...base, database: { ok: false, error: err.message } };
  }
}
