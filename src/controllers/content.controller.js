import * as contentService from "../services/content.service.js";

export function listCollections(_req, res) {
  res.json({ collections: contentService.listCollections() });
}

export async function getCollection(req, res) {
  res.json(await contentService.getCollection(req.params.collection));
}
