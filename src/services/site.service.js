import { NotFoundError } from "../errors/AppError.js";
import * as siteRepo from "../repositories/site.repository.js";

export async function getSite() {
  const [settings, pages] = await Promise.all([siteRepo.findSettings(), siteRepo.findPages()]);
  return {
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    pages,
  };
}

export async function getPage(slug) {
  const page = await siteRepo.findPageBySlug(slug);
  if (!page) throw new NotFoundError(`No page "${slug}".`);
  const sections = await siteRepo.findSectionsByPage(slug);
  return {
    ...page,
    sections: Object.fromEntries(sections.map(({ key, ...rest }) => [key, rest])),
  };
}
