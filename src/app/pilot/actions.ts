"use server";

import { headers } from "next/headers";
import { createPilotRequest, type PilotRequestResult } from "@/lib/api";

// Runs on the Next.js server and forwards the form to the API, which writes it
// to the pilot_requests table.
export async function submitPilotRequest(formData: FormData): Promise<PilotRequestResult> {
  const get = (k: string) => String(formData.get(k) ?? "");
  const h = await headers();
  const clientIp = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;

  return createPilotRequest(
    {
      name: get("name"),
      company: get("company"),
      requesterKind: get("requesterKind"),
      sites: get("sites"),
      machines: get("machines"),
      notes: get("notes"),
    },
    clientIp,
  );
}
