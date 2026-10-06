import { query } from "../db/pool.js";

// Each collection maps to one fixed query; nothing from the URL reaches SQL.
const queries = {
  steps: `SELECT sort_order AS "order", title, short_text AS "short", body
          FROM process_steps ORDER BY sort_order`,
  timeline: `SELECT time_label AS "time", label, kind
             FROM timeline_events ORDER BY sort_order`,
  tiers: `SELECT code, name, who, use_text AS "use"
          FROM evidence_tiers ORDER BY rank`,
  routes: `SELECT code, name, body FROM corroboration_routes ORDER BY sort_order`,
  metrics: `SELECT code, name, body FROM metric_definitions ORDER BY sort_order`,
  flags: `SELECT code, raised_when AS "raisedWhen", effect
          FROM flag_rules ORDER BY sort_order`,
  roles: `SELECT code, name, body FROM roles ORDER BY sort_order`,
  commercial: `SELECT code, name, body FROM commercial_terms ORDER BY sort_order`,
  "scope-rules": `SELECT name, body FROM scope_rules ORDER BY sort_order`,
  "pilot-checklist": `SELECT list, body FROM pilot_checklist ORDER BY list, sort_order`,
};

export const collectionNames = Object.freeze(Object.keys(queries));

export function hasCollection(name) {
  return Object.hasOwn(queries, name);
}

export function findCollection(name) {
  return query(queries[name]);
}
