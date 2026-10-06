import { query } from "../db/pool.js";

export function findByCodes(codes) {
  return query(
    `SELECT code, raised_when AS "raisedWhen", effect
     FROM flag_rules
     WHERE code = ANY($1::text[])`,
    [codes],
  );
}
