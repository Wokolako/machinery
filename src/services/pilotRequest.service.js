import { NotFoundError } from "../errors/AppError.js";
import * as pilotRepo from "../repositories/pilotRequest.repository.js";

/** Saves a validated pilot request and returns only what the requester needs. */
export async function createPilotRequest(input) {
  const row = await pilotRepo.insert(input);
  console.log(`[pilot] new request ${row.id} from ${row.company}`);
  return { id: row.id, createdAt: row.createdAt };
}

export async function listPilotRequests({ limit, offset }) {
  const [items, total] = await Promise.all([
    pilotRepo.findPage({ limit, offset }),
    pilotRepo.count(),
  ]);
  return { items, total, limit, offset };
}

export async function getPilotRequest(id) {
  const row = await pilotRepo.findById(id);
  if (!row) throw new NotFoundError(`No pilot request ${id}.`);
  return row;
}
