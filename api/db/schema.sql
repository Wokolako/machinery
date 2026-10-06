-- AssetYield schema. Written for PostgreSQL 13 (gen_random_uuid() is built in from 13).
-- Everything lives in its own schema so a reset never touches other databases' objects.
-- WARNING: running this file drops and recreates the assetyield schema and all its data.

DROP SCHEMA IF EXISTS assetyield CASCADE;
CREATE SCHEMA assetyield;
SET search_path TO assetyield;

-- =====================================================================
-- Site content: every piece of copy and every list the website shows.
-- =====================================================================

CREATE TABLE site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);

-- One row per page. sort_order drives navigation and the Previous/Next links.
CREATE TABLE site_pages (
  slug         text PRIMARY KEY,
  path         text NOT NULL UNIQUE,
  nav_label    text NOT NULL,
  summary      text NOT NULL,
  intro_title  text,
  intro_body   text,
  in_sequence  boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL
);

-- Headings and paragraphs for individual sections of a page.
-- body may hold several paragraphs separated by a blank line.
CREATE TABLE page_sections (
  page_slug   text NOT NULL REFERENCES site_pages (slug) ON DELETE CASCADE,
  section_key text NOT NULL,
  title       text,
  lead        text,
  body        text,
  note        text,
  PRIMARY KEY (page_slug, section_key)
);

CREATE TABLE process_steps (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  title       text NOT NULL,
  short_text  text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE timeline_events (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  time_label  text NOT NULL,
  label       text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('scope', 'log', 'check'))
);

CREATE TABLE evidence_tiers (
  code      text PRIMARY KEY,
  rank      integer NOT NULL UNIQUE,
  name      text NOT NULL,
  who       text NOT NULL,
  use_text  text NOT NULL
);

CREATE TABLE corroboration_routes (
  code        text PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  name        text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE metric_definitions (
  code        text PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  name        text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE flag_rules (
  code         text PRIMARY KEY,
  sort_order   integer NOT NULL UNIQUE,
  raised_when  text NOT NULL,
  effect       text NOT NULL
);

CREATE TABLE roles (
  code        text PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  name        text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE commercial_terms (
  code        text PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  name        text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE scope_rules (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sort_order  integer NOT NULL UNIQUE,
  name        text NOT NULL,
  body        text NOT NULL
);

CREATE TABLE pilot_checklist (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  list        text NOT NULL CHECK (list IN ('covers', 'asks')),
  sort_order  integer NOT NULL,
  body        text NOT NULL,
  UNIQUE (list, sort_order)
);

-- Requests submitted through the website's pilot form.
CREATE TABLE pilot_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  company         text NOT NULL CHECK (length(company) BETWEEN 1 AND 200),
  requester_kind  text NOT NULL CHECK (requester_kind IN ('partner', 'company')),
  sites           integer CHECK (sites IS NULL OR sites BETWEEN 1 AND 10000),
  machines        text NOT NULL CHECK (length(machines) BETWEEN 1 AND 4000),
  notes           text CHECK (notes IS NULL OR length(notes) <= 4000),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- Domain: a slice of the blueprint's object model (Section 4).
-- Money is stored in integer minor units; quantities in kilograms.
-- =====================================================================

CREATE TABLE partners (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  text NOT NULL
);

CREATE TABLE companies (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  partner_id  integer NOT NULL REFERENCES partners (id),
  name        text NOT NULL,
  currency    char(3) NOT NULL
);

CREATE TABLE people (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id  integer NOT NULL REFERENCES companies (id),
  full_name   text NOT NULL,
  role        text NOT NULL CHECK (role IN ('admin', 'supervisor', 'operator', 'approver', 'confirmer', 'auditor'))
);

CREATE TABLE machines (
  id                      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id              integer NOT NULL REFERENCES companies (id),
  asset_code              text NOT NULL,
  name                    text NOT NULL,
  machine_type            text NOT NULL,
  ownership               text NOT NULL CHECK (ownership IN ('owned', 'leased', 'partner_supplied')),
  status                  text NOT NULL CHECK (status IN ('active', 'maintenance', 'retired')),
  logging_interval_hours  integer NOT NULL CHECK (logging_interval_hours BETWEEN 1 AND 4),
  UNIQUE (company_id, asset_code)
);

CREATE TABLE materials (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id  integer NOT NULL REFERENCES companies (id),
  code        text NOT NULL,
  label       text NOT NULL,
  UNIQUE (company_id, code)
);

CREATE TABLE grades (
  id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id          integer NOT NULL REFERENCES companies (id),
  code                text NOT NULL,
  label               text NOT NULL,
  kind                text NOT NULL CHECK (kind IN ('good', 'reject', 'waste')),
  price_minor_per_kg  bigint NOT NULL CHECK (price_minor_per_kg >= 0),
  UNIQUE (company_id, code)
);

CREATE TABLE work_scopes (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  machine_id       integer NOT NULL REFERENCES machines (id),
  version          integer NOT NULL CHECK (version >= 1),
  shift_label      text NOT NULL,
  period_start     timestamptz NOT NULL,
  period_end       timestamptz NOT NULL,
  status           text NOT NULL CHECK (status IN ('draft', 'locked', 'superseded', 'closed')),
  written_by       integer NOT NULL REFERENCES people (id),
  locked_at        timestamptz,
  revision_reason  text,
  CHECK (period_end > period_start),
  UNIQUE (machine_id, period_start, version)
);

CREATE TABLE target_lines (
  id                         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope_id                   integer NOT NULL REFERENCES work_scopes (id) ON DELETE CASCADE,
  material_id                integer NOT NULL REFERENCES materials (id),
  planned_input_kg           numeric(12, 2) NOT NULL CHECK (planned_input_kg > 0),
  planned_input_value_minor  bigint NOT NULL CHECK (planned_input_value_minor > 0),
  multiplier_low             numeric(8, 2) NOT NULL,
  multiplier_high            numeric(8, 2) NOT NULL,
  planned_hours              numeric(4, 1) NOT NULL,
  destination                text NOT NULL,
  CHECK (multiplier_high > multiplier_low)
);

-- Interval logs and shift closes. Never updated: a correction is a new row
-- that points at the original through supersedes_log_id.
CREATE TABLE interval_logs (
  id                 bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  machine_id         integer NOT NULL REFERENCES machines (id),
  scope_id           integer REFERENCES work_scopes (id),
  operator_id        integer NOT NULL REFERENCES people (id),
  material_id        integer NOT NULL REFERENCES materials (id),
  kind               text NOT NULL CHECK (kind IN ('interval', 'shift_close')),
  period_start       timestamptz NOT NULL,
  period_end         timestamptz NOT NULL,
  hours_run          numeric(4, 2) NOT NULL CHECK (hours_run >= 0),
  input_qty          numeric(12, 2) NOT NULL CHECK (input_qty >= 0),
  input_unit         text NOT NULL CHECK (input_unit IN ('kg', 't')),
  waste_kg           numeric(12, 2) NOT NULL DEFAULT 0,
  supersedes_log_id  bigint REFERENCES interval_logs (id),
  reason_code        text,
  logged_at          timestamptz NOT NULL DEFAULT now(),
  prev_hash          text,
  event_hash         text NOT NULL,
  CHECK (period_end > period_start),
  CHECK ((supersedes_log_id IS NULL) = (reason_code IS NULL))
);

CREATE TABLE log_outputs (
  log_id    bigint NOT NULL REFERENCES interval_logs (id),
  grade_id  integer NOT NULL REFERENCES grades (id),
  qty_kg    numeric(12, 2) NOT NULL CHECK (qty_kg >= 0),
  PRIMARY KEY (log_id, grade_id)
);

CREATE INDEX interval_logs_machine_kind_idx ON interval_logs (machine_id, kind, period_start DESC);
CREATE INDEX interval_logs_supersedes_idx ON interval_logs (supersedes_log_id);

-- Write-once enforcement: logs and their outputs can be inserted, never changed.
CREATE FUNCTION reject_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION '% is write-once; add a superseding row instead', TG_TABLE_NAME;
END;
$$;

CREATE TRIGGER interval_logs_write_once
  BEFORE UPDATE OR DELETE ON interval_logs
  FOR EACH ROW EXECUTE FUNCTION reject_change();

CREATE TRIGGER log_outputs_write_once
  BEFORE UPDATE OR DELETE ON log_outputs
  FOR EACH ROW EXECUTE FUNCTION reject_change();
