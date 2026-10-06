import { query } from "../db/pool.js";

export function findByCompany(companyId) {
  return query(
    `SELECT code, label, kind, price_minor_per_kg AS "priceMinorPerKg"
     FROM grades
     WHERE company_id = $1
     ORDER BY price_minor_per_kg DESC, code`,
    [companyId],
  );
}
