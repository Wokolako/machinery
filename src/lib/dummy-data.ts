import "server-only";
import { createHash } from "node:crypto";
import type {
  ChecklistItem,
  DemoShift,
  FlagRule,
  LedgerEntry,
  LedgerExample,
  NamedItem,
  PageData,
  ScopeRule,
  Section,
  Site,
  Step,
  Tier,
  TimelineEvent,
} from "./api";

// A copy of api/db/seed.sql in the shapes the API answers with. The website
// falls back to it in development when the API can't be reached, so the pages
// still render without PostgreSQL. Keep it in step with seed.sql.

const settings: Record<string, string> = {
  tagline: "Machinery output verification for crushers, sorters, saws, polishers and process lines.",
  disclaimer:
    "Figures on this site are illustrative. AssetYield ships with no default bands, prices or norms; each company sets its own.",
  timezone: "Africa/Blantyre",
  meta_title: "AssetYield — Machinery output, verified",
  meta_description:
    "AssetYield records what your crushers, sorters, saws and polishers actually produce, against a work scope written before the shift, and gets every figure approved and independently confirmed.",
};

type PageRow = Omit<PageData, "sections"> & { inSequence: boolean; sections: Record<string, Partial<Section>> };

const pages: PageRow[] = [
  {
    slug: "home",
    path: "/",
    label: "Overview",
    summary: "The live shift record and the whole model on one page.",
    introTitle: null,
    introBody: null,
    inSequence: false,
    sections: {
      hero: {
        title: "Write the target before the work starts.",
        lead: "AssetYield records what your crushers, sorters, saws and polishers actually produce. Operators log every two hours against a scope the supervisor locked in advance, and every figure is approved and then confirmed by someone outside the shift.",
        note: "Try the shift record. Push the premium grade up until the multiplier leaves the supervisor's band, then try to approve it.",
      },
      rule: {
        title: "Target first, log during, check after.",
        lead: "Paper shift sheets get filled in after the fact, and targets get written to match the results. AssetYield puts the three steps back in order.",
      },
      tiers: {
        title: "Every figure says how far it has been checked.",
        lead: "Bonus qualification and partner reports use Corroborated figures: ones confirmed by someone outside the operator and supervisor.",
      },
      index: { title: "Find what you need." },
      cta: {
        title: "Run one month on your machines.",
        body: "One machinery partner, two of the companies it supplies, and one full month of shifts approved, countersigned and reported.",
      },
    },
  },
  {
    slug: "how-it-works",
    path: "/how-it-works",
    label: "How it works",
    summary: "Scope first, log every two hours, then compare, approve and confirm.",
    introTitle: "Logged while it happens, not on Friday afternoon.",
    introBody:
      "The target is written before the work, the work is logged while it happens, and the record is compared, approved and confirmed after.",
    inSequence: true,
    sections: {
      pull: {
        body: "Numbers written every two hours are harder to invent than a weekly total, and they place problems in time. A yield drop at 14:00 points to a blade change, not a bad week.",
      },
      scope: {
        title: "A revised scope can't rewrite the past.",
        lead: "Each log stays attached to the scope version that was in force when it was made, so changing the target afterwards never changes a comparison already made.",
      },
      ledger: {
        title: "Corrections are added, never typed over.",
        body: [
          "A wrong entry is fixed by a new entry that points to the original, with a reason code. Both stay visible. Once a week is locked, changing it means reopening it with a reason, which creates a new batch. The old one stays in every report as “as approved on” its date.",
          "Every event is chained to the one before it, so any report can name the exact records it was built from, and an auditor can check that none were altered.",
          "The pilot target: fewer than 1 in 100 locked records corrected for entry error over 90 days. Honest operational changes, like a breakdown or a price update, are tracked separately and never count against anyone.",
        ].join("\n\n"),
      },
    },
  },
  {
    slug: "evidence",
    path: "/evidence",
    label: "Evidence",
    summary: "Every figure says how far it has been checked, and anything unusual is flagged.",
    introTitle: "Every figure says how far it has been checked.",
    introBody: [
      "A target written in advance stops back-fitting, but it doesn't prove the result: the operator and approver work for the same company, and the bonus depends on their two signatures.",
      "So each number carries one of three tiers.",
    ].join("\n\n"),
    inSequence: true,
    sections: {
      routes: {
        title: "Three ways a shift becomes Corroborated.",
        lead: "Each company chooses which apply to each machine type, and the record shows which one raised the tier.",
        note: "A company can lower the bonus requirement to Approved. Every report it produces then says so.",
      },
      flags: {
        title: "Anything unusual is flagged, including the good news.",
        lead: "A shift that comes in far above its band is checked rather than celebrated. Every flag is visible to the operator, the approver and the partner.",
        note: "Thresholds shown are starting points. Each company sets its own.",
      },
      benchmark: {
        title: "The partner is the cheapest independent check.",
        lead: "For machines of the same type and material, the partner sees each machine's multiplier, yield and value per hour against an anonymised spread of other sites, with at least five companies in every comparison. A site that always tops the chart on its own numbers, with nothing confirming them, stands out.",
      },
    },
  },
  {
    slug: "metrics",
    path: "/metrics",
    label: "What it measures",
    summary: "Yield, multiplier, value per hour and waste, in money as well as tonnes.",
    introTitle: "What each machine converted, in money as well as tonnes.",
    introBody:
      "Calculated on every log, stored with the inputs that produced them, and recalculated whenever a correction arrives.",
    inSequence: true,
    sections: {
      example: { title: "One shift, worked through.", note: "Illustrative figures, used as a test case." },
    },
  },
  {
    slug: "who-its-for",
    path: "/who-its-for",
    label: "Who it's for",
    summary: "Paid for by the machinery partner, used at every level of the site.",
    introTitle: "Paid for by the machinery partner. Used at every level of the site.",
    introBody:
      "The supplier who equips a company deploys AssetYield and pays per active machine. Each company it supplies keeps its own records.",
    inSequence: true,
    sections: {
      roles: {
        note: "The person who logs never approves, and the person who writes the scope never confirms it. Where a small site can't staff that, the partner's countersign becomes the second signature and the record says so.",
      },
      terms: {
        title: "Who pays, who sees what, who owns it.",
        lead: "The partner sees performance only for machines it supplied. Machines a company bought elsewhere stay invisible to it, and cross-company views are always anonymised.",
      },
    },
  },
  {
    slug: "pilot",
    path: "/pilot",
    label: "Pilot",
    summary: "One partner, two companies, one month approved and countersigned.",
    introTitle: "Run one month on your machines.",
    introBody:
      "The pilot runs with one machinery partner and two of the companies it supplies, and ends with a full month of shifts approved, countersigned and reported.",
    inSequence: true,
    sections: {
      covers: { title: "What the pilot covers" },
      asks: { title: "What we'll ask you" },
      form: {
        title: "Request a pilot",
        lead: "We reply within two working days.",
        body: "Thanks. Your request is saved and we'll reply within two working days.",
        note: "For example: two jaw crushers on sapphire concentrate, one slab saw on granite.",
      },
    },
  },
];

const steps: Step[] = [
  {
    order: 1,
    title: "The supervisor writes the scope first",
    short: "Machine, material, input value and the output band it should return, locked before the shift.",
    body: "Machine, material, how much raw input and what it is worth, and the output value band this material should return on this machine. The scope locks before the shift starts. A revision becomes a new version with a reason, and logs stay attached to the version they were made against.",
  },
  {
    order: 2,
    title: "The operator logs every two hours",
    short: "Input, output by grade, waste and downtime, with a photo. Never edited, works offline.",
    body: "What went in, what came out by grade, waste and downtime, with a photo of the output or the counter. Each entry is time-stamped, tied to the device and never edited. It works offline for up to five working days and syncs with the original times.",
  },
  {
    order: 3,
    title: "The shift is compared, approved and confirmed",
    short: "Measured against the scope, locked by an approver, then confirmed by someone outside the shift.",
    body: "AssetYield computes yield, multiplier and value per hour against the scope and raises a flag on anything outside it. An approver locks the shift. Then someone outside the operator and supervisor confirms it: the receiving warehouse, the machinery partner, or a machine reading.",
  },
];

const timeline: TimelineEvent[] = [
  { time: "05:40", label: "Scope v3 locked", kind: "scope" },
  { time: "08:00", label: "Interval log", kind: "log" },
  { time: "10:00", label: "Interval log", kind: "log" },
  { time: "12:00", label: "Interval log", kind: "log" },
  { time: "14:00", label: "Shift closed", kind: "log" },
  { time: "16:10", label: "Approved", kind: "check" },
  { time: "Next day", label: "Receipt confirmed", kind: "check" },
];

const tiers: Tier[] = [
  {
    code: "logged",
    name: "Logged",
    who: "The operator's own entry.",
    use: "Shown live on the shift and on the operator's screen.",
  },
  {
    code: "approved",
    name: "Approved",
    who: "An approver locked it against the scope. The person who logs never approves.",
    use: "Used by company dashboards and monthly reports.",
  },
  {
    code: "corroborated",
    name: "Corroborated",
    who: "Confirmed by a party outside the operator and supervisor.",
    use: "Required for bonus qualification and partner reports by default.",
  },
];

const routes: NamedItem[] = [
  {
    code: "destination_receipt",
    name: "Destination receipt",
    body: "The warehouse, next line or buyer confirms the quantity and grade it received. Any variance is recorded against the approved figure.",
  },
  {
    code: "partner_countersign",
    name: "Partner countersign",
    body: "The machinery supplier reviews the week's flags and benchmark position in its console and countersigns the batch.",
  },
  {
    code: "machine_reading",
    name: "Machine reading",
    body: "A photographed hour meter, counter or weighbridge ticket, matched within tolerance to the logged hours or quantity.",
  },
];

const metrics: NamedItem[] = [
  { code: "yield", name: "Yield", body: "Good-grade output as a share of input. Reject and waste are left out." },
  {
    code: "multiplier",
    name: "Multiplier",
    body: "Output value divided by input value. Realised prices are used where a sale exists; estimates from the grade price list are labelled as estimates.",
  },
  {
    code: "band_position",
    name: "Band position",
    body: "Where the multiplier sits inside the supervisor's band. Results above the band are flagged as well as those below it.",
  },
  {
    code: "value_per_hour",
    name: "Value per hour",
    body: "Gross margin divided by hours run. A second figure includes downtime, to show utilisation.",
  },
  {
    code: "waste_value",
    name: "Waste value",
    body: "Waste quantity priced at input cost, so waste shows up in money as well as kilograms.",
  },
  {
    code: "qae",
    name: "Quality-adjusted efficiency",
    body: "Output weighted by grade, so a shift of premium stones counts for more than one of industrial grit.",
  },
  {
    code: "scope_attainment",
    name: "Scope attainment",
    body: `Actual output and value against what the scope planned. This is the "done or exceeded" figure the operator sees.`,
  },
];

const flags: FlagRule[] = [
  {
    code: "unscoped",
    raisedWhen: "A log arrived with no locked scope.",
    effect: "It can't be approved until a supervisor attaches one, with a reason.",
  },
  {
    code: "below_band",
    raisedWhen: "The multiplier is below the scope's band.",
    effect: "The approver must write a note.",
  },
  {
    code: "above_band",
    raisedWhen: "The multiplier is above the scope's band.",
    effect: "The approver must write a note and the partner is alerted.",
  },
  {
    code: "yield_outlier",
    raisedWhen: "Yield is more than two standard deviations from the machine's 8-week norm.",
    effect: "Approver note and partner alert.",
  },
  {
    code: "input_mismatch",
    raisedWhen: "Interval inputs and the shift-close total differ by more than 5%.",
    effect: "The operator reconciles before submitting.",
  },
  {
    code: "grade_drift",
    raisedWhen: "Premium share is more than 20 points from the machine's 30-day mean.",
    effect: "Shows on the weekly report and schedules a re-grade sample.",
  },
  {
    code: "photo_reuse",
    raisedWhen: "The same photo appears on two logs.",
    effect: "The second log is rejected.",
  },
  {
    code: "late_revision",
    raisedWhen: "The scope was revised after half the period had passed.",
    effect: "Labelled on every report that uses it.",
  },
];

const roles: NamedItem[] = [
  {
    code: "partner",
    name: "Machinery partner",
    body: "The supplier who deploys AssetYield to the companies it equips. Sees how each machine it supplied performs, countersigns weekly batches and benchmarks against an anonymised spread of other sites. Never edits a company's records or sees its costs unless the company grants it.",
  },
  {
    code: "admin",
    name: "Company admin",
    body: "Registers machines, sets up materials, grades, prices and destinations, assigns roles and sets the bonus rules.",
  },
  {
    code: "supervisor",
    name: "Supervisor",
    body: "Writes and revises work scopes, assigns operators to machines and watches actual against scope as the shift runs.",
  },
  {
    code: "operator",
    name: "Operator",
    body: "Logs every interval and closes the shift, and sees their own performance against the scope before submitting.",
  },
  {
    code: "approver",
    name: "Approver",
    body: "Reviews flagged shifts, confirms the destination and locks the week's batch, or returns it with a reason.",
  },
  {
    code: "destination_auditor",
    name: "Destination and auditor",
    body: "The receiver confirms what arrived. Boards, lenders and inspectors get read-only access to locked records and the audit log.",
  },
];

const commercial: NamedItem[] = [
  { code: "billing", name: "Billing", body: "Per active machine per month, invoiced to the machinery partner." },
  {
    code: "setup",
    name: "Setup",
    body: "Each company configures its own materials, grades and prices. The partner can publish a starter set per machine type for companies to copy.",
  },
  {
    code: "countersign",
    name: "Countersign",
    body: `The partner countersigns weekly batches for machines it supplied within five working days. Late countersigns show as "not countersigned" on its reports.`,
  },
  {
    code: "ownership",
    name: "Data ownership",
    body: "The company owns its records. The partner is licensed to see aggregated views and the machines it supplied.",
  },
  {
    code: "leaving",
    name: "Leaving",
    body: "A company that leaves keeps a full export of its records and reports. The partner keeps only anonymised benchmark history.",
  },
];

const scopeRules: ScopeRule[] = [
  {
    name: "Locked before the period",
    body: "A scope must be locked before the first log of its shift or week. A log with no scope is accepted but can't be approved until a supervisor attaches one, with a reason.",
  },
  {
    name: "Revisions are new versions",
    body: "A change creates version 2, 3 and so on, each with a reason and a start time. The supervisor sees a diff between versions; the approver and partner see the full history.",
  },
  {
    name: "Late revisions are labelled",
    body: "A scope revised after half its period has passed is allowed, but every report that uses it says so.",
  },
  {
    name: "Bands set with evidence",
    body: "The supervisor sets the expected band. AssetYield shows the machine's last eight weeks of actual results beside the field, so the band is based on history, not hope.",
  },
];

// Ordered as the API returns it: by list name, then position.
const pilotChecklist: ChecklistItem[] = [
  { list: "asks", body: "Which machine types and materials you run." },
  { list: "asks", body: "Who approves shifts, and who receives the output." },
  { list: "asks", body: "Whether output is sold at shift close or priced later." },
  { list: "asks", body: "How often operators can log on each machine." },
  {
    list: "covers",
    body: "Machines registered and option sets configured: materials, grades, prices, destinations and shifts.",
  },
  {
    list: "covers",
    body: "Supervisors writing scopes and operators logging every two hours, offline where the site needs it.",
  },
  {
    list: "covers",
    body: "Weekly approval, destination receipts or machine readings, and partner countersign on every supplied machine.",
  },
  {
    list: "covers",
    body: "A month-end accountability report per machine, built from records that were never edited in place.",
  },
];

const collections: Record<string, unknown> = {
  steps,
  timeline,
  tiers,
  routes,
  metrics,
  flags,
  roles,
  commercial,
  "scope-rules": scopeRules,
  "pilot-checklist": pilotChecklist,
};

// Shift closes on CR-04 in the 30 days before the demo shift (logs 1001-1006).
const history = [
  { premiumKg: 118, commercialKg: 200 },
  { premiumKg: 124, commercialKg: 201 },
  { premiumKg: 115, commercialKg: 195 },
  { premiumKg: 121, commercialKg: 201 },
  { premiumKg: 119, commercialKg: 196 },
  { premiumKg: 120, commercialKg: 200 },
];

const meanPremiumShare =
  history.reduce((sum, h) => sum + h.premiumKg / (h.premiumKg + h.commercialKg), 0) / history.length;

const flagText = (code: string) => {
  const rule = flags.find((f) => f.code === code);
  return rule ? `${rule.raisedWhen} ${rule.effect}` : "";
};

// Log 1100: the worked example, closed against scope v3 on CR-04.
const demoShift: DemoShift = {
  machine: { assetCode: "CR-04", name: "Jaw crusher" },
  shiftLabel: "Day shift",
  scopeVersion: 3,
  lockedAt: "05:40",
  material: "Sapphire concentrate",
  destination: "Jewellery manufacturing partner",
  inputKg: 400,
  inputValue: 2000,
  bandLow: 1.5,
  bandHigh: 17,
  plannedHours: 8,
  shift: { logId: 1100, hoursRun: 7.5, wasteKg: 20, goodKg: 320, premiumKg: 120 },
  prices: { premium: 150, commercial: 20 },
  meanPremiumShare,
  historyShifts: history.length,
  flagText: {
    below_band: flagText("below_band"),
    above_band: flagText("above_band"),
    grade_drift: flagText("grade_drift"),
  },
};

// Same placeholder chain the seed uses: each hash is sha256("log-<id>").
const logHash = (id: number) => createHash("sha256").update(`log-${id}`).digest("hex");

// Log 1187 recorded 140 t instead of 140 kg; 1188 supersedes it.
const ledgerEntry = (
  id: number,
  prev: number,
  inputUnit: string,
  supersedes: number | null,
  reason: string | null,
): LedgerEntry => ({
  id,
  supersedes,
  reason,
  inputQty: 140,
  inputUnit,
  prevHash: logHash(prev),
  assetCode: "CR-04",
  from: "10:00",
  to: "12:00",
  outputs: [
    { grade: "Premium jewellery", qtyKg: 44 },
    { grade: "Commercial", qtyKg: 70 },
  ],
});

const ledgerExample: LedgerExample = {
  original: ledgerEntry(1187, 1100, "t", null, null),
  replacement: ledgerEntry(1188, 1187, "kg", 1187, "wrong_unit"),
};

const site: Site = {
  settings,
  pages: pages.map(({ slug, path, label, summary, inSequence }) => ({ slug, path, label, summary, inSequence })),
};

function page(slug: string): PageData | undefined {
  const row = pages.find((p) => p.slug === slug);
  if (!row) return undefined;
  const { slug: pageSlug, path, label, summary, introTitle, introBody, sections } = row;
  return {
    slug: pageSlug,
    path,
    label,
    summary,
    introTitle,
    introBody,
    sections: Object.fromEntries(
      Object.entries(sections).map(([key, s]) => [key, { title: null, lead: null, body: null, note: null, ...s }]),
    ),
  };
}

/** The dummy answer for an API path (as passed to get()), or undefined if there is none. */
export function dummyResponse(path: string): unknown {
  const pathname = path.split("?")[0];
  if (pathname === "/site") return site;
  if (pathname === "/demo-shift") return demoShift;
  if (pathname === "/ledger-example") return ledgerExample;
  if (pathname.startsWith("/pages/")) return page(decodeURIComponent(pathname.slice("/pages/".length)));
  if (pathname.startsWith("/content/")) return collections[pathname.slice("/content/".length)];
  return undefined;
}
