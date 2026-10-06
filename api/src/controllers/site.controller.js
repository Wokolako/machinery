import * as siteService from "../services/site.service.js";

export async function getSite(_req, res) {
  res.json(await siteService.getSite());
}

export async function getPage(req, res) {
  res.json(await siteService.getPage(req.valid.params.slug));
}
