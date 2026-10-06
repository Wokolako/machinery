import { query, queryOne } from "../db/pool.js";

export function findSettings() {
  return query("SELECT key, value FROM site_settings");
}

export function findPages() {
  return query(`
    SELECT slug, path, nav_label AS "label", summary, in_sequence AS "inSequence"
    FROM site_pages
    ORDER BY sort_order
  `);
}

export function findPageBySlug(slug) {
  return queryOne(
    `SELECT slug, path, nav_label AS "label", summary,
            intro_title AS "introTitle", intro_body AS "introBody"
     FROM site_pages
     WHERE slug = $1`,
    [slug],
  );
}

export function findSectionsByPage(slug) {
  return query(
    `SELECT section_key AS "key", title, lead, body, note
     FROM page_sections
     WHERE page_slug = $1`,
    [slug],
  );
}
