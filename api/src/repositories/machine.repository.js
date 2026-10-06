import { query, queryOne } from "../db/pool.js";

const machineColumns = `
  m.id, m.asset_code AS "assetCode", m.name, m.machine_type AS "machineType",
  m.ownership, m.status, m.logging_interval_hours AS "loggingIntervalHours",
  c.id AS "companyId", c.name AS "companyName", c.currency
`;

export function findAll() {
  return query(`
    SELECT ${machineColumns}
    FROM machines m
    JOIN companies c ON c.id = m.company_id
    ORDER BY c.name, m.asset_code
  `);
}

// Asset codes are unique per company; the demo data has one company per code.
export function findByAssetCode(assetCode) {
  return queryOne(
    `SELECT ${machineColumns}
     FROM machines m
     JOIN companies c ON c.id = m.company_id
     WHERE m.asset_code = $1
     ORDER BY c.id
     LIMIT 1`,
    [assetCode],
  );
}
