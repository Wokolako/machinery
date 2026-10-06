import { query, queryOne } from "../db/pool.js";

const scopeColumns = `
  s.id, s.version, s.shift_label AS "shiftLabel", s.status,
  s.period_start AS "periodStart", s.period_end AS "periodEnd",
  s.locked_at AS "lockedAt", s.revision_reason AS "revisionReason",
  to_char(s.locked_at AT TIME ZONE tz.value, 'HH24:MI') AS "lockedLocal",
  t.planned_input_kg AS "plannedInputKg",
  t.planned_input_value_minor AS "plannedInputValueMinor",
  t.multiplier_low AS "bandLow", t.multiplier_high AS "bandHigh",
  t.planned_hours AS "plannedHours", t.destination,
  mat.label AS "material"
`;

const scopeJoins = `
  FROM work_scopes s
  LEFT JOIN target_lines t ON t.scope_id = s.id
  LEFT JOIN materials mat ON mat.id = t.material_id
  CROSS JOIN (SELECT value FROM site_settings WHERE key = 'timezone') tz
`;

/** The most recent locked scope on a machine (latest period, highest version). */
export function findLatestLocked(machineId) {
  return queryOne(
    `SELECT ${scopeColumns}
     ${scopeJoins}
     WHERE s.machine_id = $1 AND s.status = 'locked'
     ORDER BY s.period_start DESC, s.version DESC
     LIMIT 1`,
    [machineId],
  );
}

/** Every scope version on a machine, newest period and version first. */
export function findAllVersions(machineId) {
  return query(
    `SELECT ${scopeColumns}
     ${scopeJoins}
     WHERE s.machine_id = $1
     ORDER BY s.period_start DESC, s.version DESC`,
    [machineId],
  );
}
