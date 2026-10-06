-- Dummy data for the AssetYield website. All names and figures are illustrative.
SET search_path TO assetyield;

-- =====================================================================
-- Site settings and pages
-- =====================================================================

INSERT INTO site_settings (key, value) VALUES
  ('tagline', 'Machinery output verification for crushers, sorters, saws, polishers and process lines.'),
  ('disclaimer', 'Figures on this site are illustrative. AssetYield ships with no default bands, prices or norms; each company sets its own.'),
  ('timezone', 'Africa/Blantyre'),
  ('meta_title', 'AssetYield — Machinery output, verified'),
  ('meta_description', 'AssetYield records what your crushers, sorters, saws and polishers actually produce, against a work scope written before the shift, and gets every figure approved and independently confirmed.');

INSERT INTO site_pages (slug, path, nav_label, summary, intro_title, intro_body, in_sequence, sort_order) VALUES
  ('home', '/', 'Overview',
   'The live shift record and the whole model on one page.',
   NULL, NULL, false, 0),
  ('how-it-works', '/how-it-works', 'How it works',
   'Scope first, log every two hours, then compare, approve and confirm.',
   'Logged while it happens, not on Friday afternoon.',
   'The target is written before the work, the work is logged while it happens, and the record is compared, approved and confirmed after.',
   true, 1),
  ('evidence', '/evidence', 'Evidence',
   'Every figure says how far it has been checked, and anything unusual is flagged.',
   'Every figure says how far it has been checked.',
   E'A target written in advance stops back-fitting, but it doesn''t prove the result: the operator and approver work for the same company, and the bonus depends on their two signatures.\n\nSo each number carries one of three tiers.',
   true, 2),
  ('metrics', '/metrics', 'What it measures',
   'Yield, multiplier, value per hour and waste, in money as well as tonnes.',
   'What each machine converted, in money as well as tonnes.',
   'Calculated on every log, stored with the inputs that produced them, and recalculated whenever a correction arrives.',
   true, 3),
  ('who-its-for', '/who-its-for', 'Who it''s for',
   'Paid for by the machinery partner, used at every level of the site.',
   'Paid for by the machinery partner. Used at every level of the site.',
   'The supplier who equips a company deploys AssetYield and pays per active machine. Each company it supplies keeps its own records.',
   true, 4),
  ('pilot', '/pilot', 'Pilot',
   'One partner, two companies, one month approved and countersigned.',
   'Run one month on your machines.',
   'The pilot runs with one machinery partner and two of the companies it supplies, and ends with a full month of shifts approved, countersigned and reported.',
   true, 5);

INSERT INTO page_sections (page_slug, section_key, title, lead, body, note) VALUES
  ('home', 'hero',
   'Write the target before the work starts.',
   'AssetYield records what your crushers, sorters, saws and polishers actually produce. Operators log every two hours against a scope the supervisor locked in advance, and every figure is approved and then confirmed by someone outside the shift.',
   NULL,
   'Try the shift record. Push the premium grade up until the multiplier leaves the supervisor''s band, then try to approve it.'),
  ('home', 'rule',
   'Target first, log during, check after.',
   'Paper shift sheets get filled in after the fact, and targets get written to match the results. AssetYield puts the three steps back in order.',
   NULL, NULL),
  ('home', 'tiers',
   'Every figure says how far it has been checked.',
   'Bonus qualification and partner reports use Corroborated figures: ones confirmed by someone outside the operator and supervisor.',
   NULL, NULL),
  ('home', 'index', 'Find what you need.', NULL, NULL, NULL),
  ('home', 'cta',
   'Run one month on your machines.',
   NULL,
   'One machinery partner, two of the companies it supplies, and one full month of shifts approved, countersigned and reported.',
   NULL),

  ('how-it-works', 'pull', NULL, NULL,
   'Numbers written every two hours are harder to invent than a weekly total, and they place problems in time. A yield drop at 14:00 points to a blade change, not a bad week.',
   NULL),
  ('how-it-works', 'scope',
   'A revised scope can''t rewrite the past.',
   'Each log stays attached to the scope version that was in force when it was made, so changing the target afterwards never changes a comparison already made.',
   NULL, NULL),
  ('how-it-works', 'ledger',
   'Corrections are added, never typed over.',
   NULL,
   E'A wrong entry is fixed by a new entry that points to the original, with a reason code. Both stay visible. Once a week is locked, changing it means reopening it with a reason, which creates a new batch. The old one stays in every report as “as approved on” its date.\n\nEvery event is chained to the one before it, so any report can name the exact records it was built from, and an auditor can check that none were altered.\n\nThe pilot target: fewer than 1 in 100 locked records corrected for entry error over 90 days. Honest operational changes, like a breakdown or a price update, are tracked separately and never count against anyone.',
   NULL),

  ('evidence', 'routes',
   'Three ways a shift becomes Corroborated.',
   'Each company chooses which apply to each machine type, and the record shows which one raised the tier.',
   NULL,
   'A company can lower the bonus requirement to Approved. Every report it produces then says so.'),
  ('evidence', 'flags',
   'Anything unusual is flagged, including the good news.',
   'A shift that comes in far above its band is checked rather than celebrated. Every flag is visible to the operator, the approver and the partner.',
   NULL,
   'Thresholds shown are starting points. Each company sets its own.'),
  ('evidence', 'benchmark',
   'The partner is the cheapest independent check.',
   'For machines of the same type and material, the partner sees each machine''s multiplier, yield and value per hour against an anonymised spread of other sites, with at least five companies in every comparison. A site that always tops the chart on its own numbers, with nothing confirming them, stands out.',
   NULL, NULL),

  ('metrics', 'example', 'One shift, worked through.', NULL, NULL,
   'Illustrative figures, used as a test case.'),

  ('who-its-for', 'roles', NULL, NULL, NULL,
   'The person who logs never approves, and the person who writes the scope never confirms it. Where a small site can''t staff that, the partner''s countersign becomes the second signature and the record says so.'),
  ('who-its-for', 'terms',
   'Who pays, who sees what, who owns it.',
   'The partner sees performance only for machines it supplied. Machines a company bought elsewhere stay invisible to it, and cross-company views are always anonymised.',
   NULL, NULL),

  ('pilot', 'covers', 'What the pilot covers', NULL, NULL, NULL),
  ('pilot', 'asks', 'What we''ll ask you', NULL, NULL, NULL),
  ('pilot', 'form',
   'Request a pilot',
   'We reply within two working days.',
   'Thanks. Your request is saved and we''ll reply within two working days.',
   'For example: two jaw crushers on sapphire concentrate, one slab saw on granite.');

-- =====================================================================
-- Lists shown across the site
-- =====================================================================

INSERT INTO process_steps (sort_order, title, short_text, body) VALUES
  (1, 'The supervisor writes the scope first',
   'Machine, material, input value and the output band it should return, locked before the shift.',
   'Machine, material, how much raw input and what it is worth, and the output value band this material should return on this machine. The scope locks before the shift starts. A revision becomes a new version with a reason, and logs stay attached to the version they were made against.'),
  (2, 'The operator logs every two hours',
   'Input, output by grade, waste and downtime, with a photo. Never edited, works offline.',
   'What went in, what came out by grade, waste and downtime, with a photo of the output or the counter. Each entry is time-stamped, tied to the device and never edited. It works offline for up to five working days and syncs with the original times.'),
  (3, 'The shift is compared, approved and confirmed',
   'Measured against the scope, locked by an approver, then confirmed by someone outside the shift.',
   'AssetYield computes yield, multiplier and value per hour against the scope and raises a flag on anything outside it. An approver locks the shift. Then someone outside the operator and supervisor confirms it: the receiving warehouse, the machinery partner, or a machine reading.');

INSERT INTO timeline_events (sort_order, time_label, label, kind) VALUES
  (1, '05:40', 'Scope v3 locked', 'scope'),
  (2, '08:00', 'Interval log', 'log'),
  (3, '10:00', 'Interval log', 'log'),
  (4, '12:00', 'Interval log', 'log'),
  (5, '14:00', 'Shift closed', 'log'),
  (6, '16:10', 'Approved', 'check'),
  (7, 'Next day', 'Receipt confirmed', 'check');

INSERT INTO evidence_tiers (code, rank, name, who, use_text) VALUES
  ('logged', 1, 'Logged', 'The operator''s own entry.', 'Shown live on the shift and on the operator''s screen.'),
  ('approved', 2, 'Approved', 'An approver locked it against the scope. The person who logs never approves.', 'Used by company dashboards and monthly reports.'),
  ('corroborated', 3, 'Corroborated', 'Confirmed by a party outside the operator and supervisor.', 'Required for bonus qualification and partner reports by default.');

INSERT INTO corroboration_routes (code, sort_order, name, body) VALUES
  ('destination_receipt', 1, 'Destination receipt', 'The warehouse, next line or buyer confirms the quantity and grade it received. Any variance is recorded against the approved figure.'),
  ('partner_countersign', 2, 'Partner countersign', 'The machinery supplier reviews the week''s flags and benchmark position in its console and countersigns the batch.'),
  ('machine_reading', 3, 'Machine reading', 'A photographed hour meter, counter or weighbridge ticket, matched within tolerance to the logged hours or quantity.');

INSERT INTO metric_definitions (code, sort_order, name, body) VALUES
  ('yield', 1, 'Yield', 'Good-grade output as a share of input. Reject and waste are left out.'),
  ('multiplier', 2, 'Multiplier', 'Output value divided by input value. Realised prices are used where a sale exists; estimates from the grade price list are labelled as estimates.'),
  ('band_position', 3, 'Band position', 'Where the multiplier sits inside the supervisor''s band. Results above the band are flagged as well as those below it.'),
  ('value_per_hour', 4, 'Value per hour', 'Gross margin divided by hours run. A second figure includes downtime, to show utilisation.'),
  ('waste_value', 5, 'Waste value', 'Waste quantity priced at input cost, so waste shows up in money as well as kilograms.'),
  ('qae', 6, 'Quality-adjusted efficiency', 'Output weighted by grade, so a shift of premium stones counts for more than one of industrial grit.'),
  ('scope_attainment', 7, 'Scope attainment', 'Actual output and value against what the scope planned. This is the "done or exceeded" figure the operator sees.');

INSERT INTO flag_rules (code, sort_order, raised_when, effect) VALUES
  ('unscoped', 1, 'A log arrived with no locked scope.', 'It can''t be approved until a supervisor attaches one, with a reason.'),
  ('below_band', 2, 'The multiplier is below the scope''s band.', 'The approver must write a note.'),
  ('above_band', 3, 'The multiplier is above the scope''s band.', 'The approver must write a note and the partner is alerted.'),
  ('yield_outlier', 4, 'Yield is more than two standard deviations from the machine''s 8-week norm.', 'Approver note and partner alert.'),
  ('input_mismatch', 5, 'Interval inputs and the shift-close total differ by more than 5%.', 'The operator reconciles before submitting.'),
  ('grade_drift', 6, 'Premium share is more than 20 points from the machine''s 30-day mean.', 'Shows on the weekly report and schedules a re-grade sample.'),
  ('photo_reuse', 7, 'The same photo appears on two logs.', 'The second log is rejected.'),
  ('late_revision', 8, 'The scope was revised after half the period had passed.', 'Labelled on every report that uses it.');

INSERT INTO roles (code, sort_order, name, body) VALUES
  ('partner', 1, 'Machinery partner', 'The supplier who deploys AssetYield to the companies it equips. Sees how each machine it supplied performs, countersigns weekly batches and benchmarks against an anonymised spread of other sites. Never edits a company''s records or sees its costs unless the company grants it.'),
  ('admin', 2, 'Company admin', 'Registers machines, sets up materials, grades, prices and destinations, assigns roles and sets the bonus rules.'),
  ('supervisor', 3, 'Supervisor', 'Writes and revises work scopes, assigns operators to machines and watches actual against scope as the shift runs.'),
  ('operator', 4, 'Operator', 'Logs every interval and closes the shift, and sees their own performance against the scope before submitting.'),
  ('approver', 5, 'Approver', 'Reviews flagged shifts, confirms the destination and locks the week''s batch, or returns it with a reason.'),
  ('destination_auditor', 6, 'Destination and auditor', 'The receiver confirms what arrived. Boards, lenders and inspectors get read-only access to locked records and the audit log.');

INSERT INTO commercial_terms (code, sort_order, name, body) VALUES
  ('billing', 1, 'Billing', 'Per active machine per month, invoiced to the machinery partner.'),
  ('setup', 2, 'Setup', 'Each company configures its own materials, grades and prices. The partner can publish a starter set per machine type for companies to copy.'),
  ('countersign', 3, 'Countersign', 'The partner countersigns weekly batches for machines it supplied within five working days. Late countersigns show as "not countersigned" on its reports.'),
  ('ownership', 4, 'Data ownership', 'The company owns its records. The partner is licensed to see aggregated views and the machines it supplied.'),
  ('leaving', 5, 'Leaving', 'A company that leaves keeps a full export of its records and reports. The partner keeps only anonymised benchmark history.');

INSERT INTO scope_rules (sort_order, name, body) VALUES
  (1, 'Locked before the period', 'A scope must be locked before the first log of its shift or week. A log with no scope is accepted but can''t be approved until a supervisor attaches one, with a reason.'),
  (2, 'Revisions are new versions', 'A change creates version 2, 3 and so on, each with a reason and a start time. The supervisor sees a diff between versions; the approver and partner see the full history.'),
  (3, 'Late revisions are labelled', 'A scope revised after half its period has passed is allowed, but every report that uses it says so.'),
  (4, 'Bands set with evidence', 'The supervisor sets the expected band. AssetYield shows the machine''s last eight weeks of actual results beside the field, so the band is based on history, not hope.');

INSERT INTO pilot_checklist (list, sort_order, body) VALUES
  ('covers', 1, 'Machines registered and option sets configured: materials, grades, prices, destinations and shifts.'),
  ('covers', 2, 'Supervisors writing scopes and operators logging every two hours, offline where the site needs it.'),
  ('covers', 3, 'Weekly approval, destination receipts or machine readings, and partner countersign on every supplied machine.'),
  ('covers', 4, 'A month-end accountability report per machine, built from records that were never edited in place.'),
  ('asks', 1, 'Which machine types and materials you run.'),
  ('asks', 2, 'Who approves shifts, and who receives the output.'),
  ('asks', 3, 'Whether output is sold at shift close or priced later.'),
  ('asks', 4, 'How often operators can log on each machine.');

-- =====================================================================
-- Domain dummy data
-- =====================================================================

INSERT INTO partners (name) VALUES ('Kopje Machinery Supply');

INSERT INTO companies (partner_id, name, currency) VALUES
  ((SELECT id FROM partners WHERE name = 'Kopje Machinery Supply'), 'Lindiwe Gem Processing', 'USD'),
  ((SELECT id FROM partners WHERE name = 'Kopje Machinery Supply'), 'Ridgeback Stone Works', 'USD');

INSERT INTO people (company_id, full_name, role)
SELECT c.id, p.full_name, p.role
FROM companies c
CROSS JOIN (VALUES
  ('T. Banda', 'supervisor'),
  ('R. Phiri', 'operator'),
  ('M. Chirwa', 'approver'),
  ('Warehouse desk', 'confirmer')
) AS p (full_name, role)
WHERE c.name = 'Lindiwe Gem Processing';

INSERT INTO machines (company_id, asset_code, name, machine_type, ownership, status, logging_interval_hours)
SELECT c.id, m.asset_code, m.name, m.machine_type, m.ownership, m.status, m.interval_h
FROM companies c
CROSS JOIN (VALUES
  ('CR-04', 'Jaw crusher', 'crusher', 'partner_supplied', 'active', 2),
  ('SR-01', 'Optical sorter', 'sorter', 'partner_supplied', 'active', 2),
  ('PL-02', 'Cabochon polisher', 'polisher', 'owned', 'maintenance', 3)
) AS m (asset_code, name, machine_type, ownership, status, interval_h)
WHERE c.name = 'Lindiwe Gem Processing';

INSERT INTO materials (company_id, code, label)
SELECT c.id, m.code, m.label
FROM companies c
CROSS JOIN (VALUES
  ('sapphire_conc', 'Sapphire concentrate'),
  ('emerald_rough', 'Emerald rough')
) AS m (code, label)
WHERE c.name = 'Lindiwe Gem Processing';

-- Prices in minor units per kg: premium 150.00, commercial 20.00.
INSERT INTO grades (company_id, code, label, kind, price_minor_per_kg)
SELECT c.id, g.code, g.label, g.kind, g.price
FROM companies c
CROSS JOIN (VALUES
  ('premium', 'Premium jewellery', 'good', 15000),
  ('commercial', 'Commercial', 'good', 2000),
  ('reject', 'Reject', 'reject', 0),
  ('waste', 'Waste', 'waste', 0)
) AS g (code, label, kind, price)
WHERE c.name = 'Lindiwe Gem Processing';

-- Scope for the demo shift: v1 and v2 were superseded, v3 is in force.
INSERT INTO work_scopes (machine_id, version, shift_label, period_start, period_end, status, written_by, locked_at, revision_reason)
SELECT m.id, v.version, 'Day shift', '2026-09-21 06:00+02', '2026-09-21 14:00+02', v.status,
       (SELECT id FROM people WHERE full_name = 'T. Banda'), v.locked_at::timestamptz, v.reason
FROM machines m
CROSS JOIN (VALUES
  (1, 'superseded', '2026-09-20 16:30+02', NULL),
  (2, 'superseded', '2026-09-20 18:05+02', 'material_changed'),
  (3, 'locked', '2026-09-21 05:40+02', 'plan_changed')
) AS v (version, status, locked_at, reason)
WHERE m.asset_code = 'CR-04';

-- Band 1.5x to 17x on 400 kg valued 2,000.00.
INSERT INTO target_lines (scope_id, material_id, planned_input_kg, planned_input_value_minor, multiplier_low, multiplier_high, planned_hours, destination)
SELECT s.id, (SELECT id FROM materials WHERE code = 'sapphire_conc'), 400, 200000, 1.5, 17.0, 8.0, 'Jewellery manufacturing partner'
FROM work_scopes s
JOIN machines m ON m.id = s.machine_id
WHERE m.asset_code = 'CR-04' AND s.version = 3;

-- Thirty days of shift closes on CR-04 before the demo shift. Their premium
-- share is the machine's 30-day mean used by the grade_drift rule.
INSERT INTO interval_logs (id, machine_id, scope_id, operator_id, material_id, kind, period_start, period_end, hours_run, input_qty, input_unit, waste_kg, logged_at, prev_hash, event_hash)
SELECT h.id,
       (SELECT id FROM machines WHERE asset_code = 'CR-04'),
       NULL,
       (SELECT id FROM people WHERE full_name = 'R. Phiri'),
       (SELECT id FROM materials WHERE code = 'sapphire_conc'),
       'shift_close',
       h.day + time '06:00',
       h.day + time '14:00',
       7.5, 400, 'kg', 20,
       h.day + time '14:05',
       encode(sha256(convert_to('log-' || (h.id - 1), 'UTF8')), 'hex'),
       encode(sha256(convert_to('log-' || h.id, 'UTF8')), 'hex')
FROM (VALUES
  (1001, date '2026-08-24'),
  (1002, date '2026-08-27'),
  (1003, date '2026-08-31'),
  (1004, date '2026-09-03'),
  (1005, date '2026-09-08'),
  (1006, date '2026-09-14')
) AS h (id, day);

INSERT INTO log_outputs (log_id, grade_id, qty_kg)
SELECT o.log_id, g.id, o.qty
FROM (VALUES
  (1001, 'premium', 118), (1001, 'commercial', 200), (1001, 'reject', 62),
  (1002, 'premium', 124), (1002, 'commercial', 201), (1002, 'reject', 55),
  (1003, 'premium', 115), (1003, 'commercial', 195), (1003, 'reject', 70),
  (1004, 'premium', 121), (1004, 'commercial', 201), (1004, 'reject', 58),
  (1005, 'premium', 119), (1005, 'commercial', 196), (1005, 'reject', 65),
  (1006, 'premium', 120), (1006, 'commercial', 200), (1006, 'reject', 60)
) AS o (log_id, grade_code, qty)
JOIN grades g ON g.code = o.grade_code;

-- The demo shift: Section 7's worked example, closed against scope v3.
INSERT INTO interval_logs (id, machine_id, scope_id, operator_id, material_id, kind, period_start, period_end, hours_run, input_qty, input_unit, waste_kg, logged_at, prev_hash, event_hash)
SELECT 1100,
       m.id,
       (SELECT s.id FROM work_scopes s WHERE s.machine_id = m.id AND s.version = 3),
       (SELECT id FROM people WHERE full_name = 'R. Phiri'),
       (SELECT id FROM materials WHERE code = 'sapphire_conc'),
       'shift_close',
       '2026-09-21 06:00+02', '2026-09-21 14:00+02',
       7.5, 400, 'kg', 20,
       '2026-09-21 14:04+02',
       encode(sha256(convert_to('log-1006', 'UTF8')), 'hex'),
       encode(sha256(convert_to('log-1100', 'UTF8')), 'hex')
FROM machines m
WHERE m.asset_code = 'CR-04';

INSERT INTO log_outputs (log_id, grade_id, qty_kg)
SELECT 1100, g.id, o.qty
FROM (VALUES ('premium', 120), ('commercial', 200), ('reject', 60)) AS o (grade_code, qty)
JOIN grades g ON g.code = o.grade_code;

-- A correction: log 1187 recorded 140 t instead of 140 kg; 1188 supersedes it.
INSERT INTO interval_logs (id, machine_id, scope_id, operator_id, material_id, kind, period_start, period_end, hours_run, input_qty, input_unit, waste_kg, supersedes_log_id, reason_code, logged_at, prev_hash, event_hash)
SELECT l.id,
       (SELECT id FROM machines WHERE asset_code = 'CR-04'),
       NULL,
       (SELECT id FROM people WHERE full_name = 'R. Phiri'),
       (SELECT id FROM materials WHERE code = 'sapphire_conc'),
       'interval',
       '2026-09-22 10:00+02', '2026-09-22 12:00+02',
       2, 140, l.unit, 0,
       l.supersedes, l.reason,
       l.logged_at::timestamptz,
       encode(sha256(convert_to('log-' || l.prev, 'UTF8')), 'hex'),
       encode(sha256(convert_to('log-' || l.id, 'UTF8')), 'hex')
FROM (VALUES
  (1187, 't', NULL::bigint, NULL, '2026-09-22 12:02+02', 1100),
  (1188, 'kg', 1187, 'wrong_unit', '2026-09-22 12:09+02', 1187)
) AS l (id, unit, supersedes, reason, logged_at, prev);

INSERT INTO log_outputs (log_id, grade_id, qty_kg)
SELECT o.log_id, g.id, o.qty
FROM (VALUES
  (1187, 'premium', 44), (1187, 'commercial', 70),
  (1188, 'premium', 44), (1188, 'commercial', 70)
) AS o (log_id, grade_code, qty)
JOIN grades g ON g.code = o.grade_code;

SELECT setval(pg_get_serial_sequence('assetyield.interval_logs', 'id'), (SELECT max(id) FROM interval_logs));
