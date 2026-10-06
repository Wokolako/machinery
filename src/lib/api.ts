import "server-only";
import { cache } from "react";

// Every piece of content on the site comes from the AssetYield API, which
// reads it from PostgreSQL. Requests are never cached, so a change in the
// database shows on the next page load.
const API_URL = process.env.API_URL ?? "http://127.0.0.1:4000";

export type SitePage = {
  slug: string;
  path: string;
  label: string;
  summary: string;
  inSequence: boolean;
};

export type Site = {
  settings: Record<string, string>;
  pages: SitePage[];
};

export type Section = {
  title: string | null;
  lead: string | null;
  body: string | null;
  note: string | null;
};

export type PageData = {
  slug: string;
  path: string;
  label: string;
  summary: string;
  introTitle: string | null;
  introBody: string | null;
  sections: Record<string, Section>;
};

export type Step = { order: number; title: string; short: string; body: string };
export type TimelineEvent = { time: string; label: string; kind: "scope" | "log" | "check" };
export type Tier = { code: string; name: string; who: string; use: string };
export type NamedItem = { code: string; name: string; body: string };
export type FlagRule = { code: string; raisedWhen: string; effect: string };
export type ScopeRule = { name: string; body: string };
export type ChecklistItem = { list: "covers" | "asks"; body: string };

export type DemoShift = {
  machine: { assetCode: string; name: string };
  shiftLabel: string;
  scopeVersion: number;
  lockedAt: string;
  material: string;
  destination: string;
  inputKg: number;
  inputValue: number;
  bandLow: number;
  bandHigh: number;
  plannedHours: number;
  shift: {
    logId: number;
    hoursRun: number;
    wasteKg: number;
    goodKg: number;
    premiumKg: number;
  };
  prices: { premium: number; commercial: number };
  meanPremiumShare: number;
  historyShifts: number;
  flagText: Record<string, string>;
};

export type LedgerEntry = {
  id: number;
  supersedes: number | null;
  reason: string | null;
  inputQty: number;
  inputUnit: string;
  prevHash: string;
  assetCode: string;
  from: string;
  to: string;
  outputs: { grade: string; qtyKg: number }[];
};

export type LedgerExample = { original: LedgerEntry; replacement: LedgerEntry };

export class ApiUnavailableError extends Error {}

let warnedDummy = false;
function warnDummyOnce() {
  if (warnedDummy) return;
  warnedDummy = true;
  console.warn(`[api] ${API_URL} is unreachable; serving dummy data from src/lib/dummy-data.ts.`);
}

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  } catch {
    // In development the pages still render without the API, from a copy of
    // the seed data. Production never substitutes dummy content.
    if (process.env.NODE_ENV !== "production") {
      const { dummyResponse } = await import("./dummy-data");
      const data = dummyResponse(path);
      if (data !== undefined) {
        warnDummyOnce();
        return data as T;
      }
    }
    throw new ApiUnavailableError(
      `Couldn't reach the AssetYield API at ${API_URL}. Start it with "npm run dev" in the assetyield-api folder.`,
    );
  }
  if (!res.ok) {
    throw new Error(`The API returned ${res.status} for ${path}.`);
  }
  return res.json() as Promise<T>;
}

// cache() dedupes identical calls within one request (layout + page).
export const getSite = cache(() => get<Site>("/site"));
export const getPage = cache((slug: string) => get<PageData>(`/pages/${encodeURIComponent(slug)}`));

export const getSteps = cache(() => get<Step[]>("/content/steps"));
export const getTimeline = cache(() => get<TimelineEvent[]>("/content/timeline"));
export const getTiers = cache(() => get<Tier[]>("/content/tiers"));
export const getRoutes = cache(() => get<NamedItem[]>("/content/routes"));
export const getMetrics = cache(() => get<NamedItem[]>("/content/metrics"));
export const getFlags = cache(() => get<FlagRule[]>("/content/flags"));
export const getRoles = cache(() => get<NamedItem[]>("/content/roles"));
export const getCommercial = cache(() => get<NamedItem[]>("/content/commercial"));
export const getScopeRules = cache(() => get<ScopeRule[]>("/content/scope-rules"));
export const getPilotChecklist = cache(() => get<ChecklistItem[]>("/content/pilot-checklist"));

export const getDemoShift = cache(() => get<DemoShift>("/demo-shift"));
export const getLedgerExample = cache(() => get<LedgerExample>("/ledger-example"));

export type PilotRequestInput = {
  name: string;
  company: string;
  requesterKind: string;
  sites: string;
  machines: string;
  notes: string;
};

export type PilotRequestResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> };

type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: Record<string, string> };
};

// clientIp is forwarded so the API rate-limits each visitor, not this server.
export async function createPilotRequest(
  input: PilotRequestInput,
  clientIp?: string,
): Promise<PilotRequestResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/pilot-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  } catch {
    return { ok: false, errors: { form: "The server couldn't be reached. Try again in a minute." } };
  }
  if (res.status === 400) {
    const data = (await res.json()) as ApiErrorBody;
    return { ok: false, errors: data.error?.details ?? { form: "Check the form and try again." } };
  }
  if (res.status === 429) {
    return {
      ok: false,
      errors: { form: "Too many requests from your network. Wait a few minutes and try again." },
    };
  }
  if (!res.ok) {
    return { ok: false, errors: { form: "The request couldn't be saved. Try again in a minute." } };
  }
  const data = (await res.json()) as { id: string };
  return { ok: true, id: data.id };
}

// Splits a stored text field into paragraphs on blank lines.
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function section(page: PageData, key: string): Section {
  return page.sections[key] ?? { title: null, lead: null, body: null, note: null };
}
