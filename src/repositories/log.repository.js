import { query, queryOne } from "../db/pool.js";

// A log counts as current when nothing supersedes it.
const isCurrent = `NOT EXISTS (SELECT 1 FROM interval_logs n WHERE n.supersedes_log_id = l.id)`;

// Outputs of a log with their grade, kind and price, as a JSON array.
const outputsJson = `
  coalesce((
    SELECT json_agg(json_build_object(
             'gradeCode', g.code, 'grade', g.label, 'kind', g.kind,
             'qtyKg', o.qty_kg, 'priceMinorPerKg', g.price_minor_per_kg)
           ORDER BY g.price_minor_per_kg DESC, g.code)
    FROM log_outputs o JOIN grades g ON g.id = o.grade_id
    WHERE o.log_id = l.id
  ), '[]'::json)
`;

const logColumns = `
  l.id, l.kind, l.scope_id AS "scopeId", l.period_start AS "periodStart",
  l.period_end AS "periodEnd", l.hours_run AS "hoursRun", l.input_qty AS "inputQty",
  l.input_unit AS "inputUnit", l.waste_kg AS "wasteKg", l.logged_at AS "loggedAt",
  l.supersedes_log_id AS "supersedes", l.reason_code AS "reason",
  l.prev_hash AS "prevHash", l.event_hash AS "eventHash",
  ${outputsJson} AS outputs
`;

/** Latest current shift close logged against a scope. */
export function findCurrentShiftClose(scopeId) {
  return queryOne(
    `SELECT ${logColumns}
     FROM interval_logs l
     WHERE l.scope_id = $1 AND l.kind = 'shift_close' AND ${isCurrent}
     ORDER BY l.logged_at DESC
     LIMIT 1`,
    [scopeId],
  );
}

/** Recent current shift closes on a machine, with the band of their scope if any. */
export function findShiftCloses(machineId, limit) {
  return query(
    `SELECT ${logColumns},
            t.multiplier_low AS "bandLow", t.multiplier_high AS "bandHigh",
            t.planned_input_value_minor AS "plannedInputValueMinor"
     FROM interval_logs l
     LEFT JOIN target_lines t ON t.scope_id = l.scope_id
     WHERE l.machine_id = $1 AND l.kind = 'shift_close' AND ${isCurrent}
     ORDER BY l.period_start DESC
     LIMIT $2`,
    [machineId, limit],
  );
}

/**
 * Mean premium share (premium kg over good kg) of a machine's current shift
 * closes in the 30 days before a moment. Feeds the grade_drift rule.
 */
export function findPremiumShareHistory(machineId, before) {
  return queryOne(
    `SELECT avg(prem.qty / NULLIF(good.qty, 0)) AS "meanShare", count(*) AS "shifts"
     FROM interval_logs l
     JOIN LATERAL (
       SELECT sum(o.qty_kg) AS qty FROM log_outputs o JOIN grades g ON g.id = o.grade_id
       WHERE o.log_id = l.id AND g.kind = 'good'
     ) good ON true
     JOIN LATERAL (
       SELECT sum(o.qty_kg) AS qty FROM log_outputs o JOIN grades g ON g.id = o.grade_id
       WHERE o.log_id = l.id AND g.code = 'premium'
     ) prem ON true
     WHERE l.machine_id = $1 AND l.kind = 'shift_close'
       AND l.period_start >= $2::timestamptz - interval '30 days'
       AND l.period_start < $2::timestamptz
       AND ${isCurrent}`,
    [machineId, before],
  );
}

/** The most recent correction and the log it superseded, oldest first. */
export function findLatestCorrectionPair() {
  return query(
    `WITH latest AS (
       SELECT id, supersedes_log_id FROM interval_logs
       WHERE supersedes_log_id IS NOT NULL
       ORDER BY logged_at DESC
       LIMIT 1
     )
     SELECT ${logColumns},
            m.asset_code AS "assetCode",
            to_char(l.period_start AT TIME ZONE tz.value, 'HH24:MI') AS "from",
            to_char(l.period_end AT TIME ZONE tz.value, 'HH24:MI') AS "to"
     FROM latest
     JOIN interval_logs l ON l.id IN (latest.id, latest.supersedes_log_id)
     JOIN machines m ON m.id = l.machine_id
     CROSS JOIN (SELECT value FROM site_settings WHERE key = 'timezone') tz
     ORDER BY l.id`,
  );
}
