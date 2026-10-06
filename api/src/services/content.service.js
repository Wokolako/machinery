import { NotFoundError } from "../errors/AppError.js";
import * as contentRepo from "../repositories/content.repository.js";

export function listCollections() {
  return contentRepo.collectionNames;
}

export async function getCollection(name) {
  if (!contentRepo.hasCollection(name)) {
    throw new NotFoundError(
      `No collection "${name}". Available: ${contentRepo.collectionNames.join(", ")}.`,
    );
  }
  return contentRepo.findCollection(name);
}
