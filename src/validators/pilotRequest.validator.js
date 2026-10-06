import { z } from "zod";

const optionalText = (max, tooLong) =>
  z
    .string()
    .trim()
    .max(max, { message: tooLong })
    .optional()
    .transform((v) => (v ? v : null));

// Body of POST /api/pilot-requests. Messages are written for the person
// filling in the form; the website shows them next to each field.
export const createPilotRequestSchema = z.object({
  name: z
    .string({ message: "Enter your name." })
    .trim()
    .min(1, { message: "Enter your name." })
    .max(200, { message: "Use 200 characters or fewer." }),
  company: z
    .string({ message: "Enter your company's name." })
    .trim()
    .min(1, { message: "Enter your company's name." })
    .max(200, { message: "Use 200 characters or fewer." }),
  requesterKind: z.enum(["partner", "company"], {
    message: "Choose whether you supply machines or run them.",
  }),
  sites: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v, ctx) => {
      if (v === undefined || v === null || String(v).trim() === "") return null;
      const n = Number(String(v).trim());
      if (!Number.isInteger(n) || n < 1 || n > 10000) {
        ctx.addIssue({ code: "custom", message: "Enter a whole number of sites, or leave it blank." });
        return z.NEVER;
      }
      return n;
    }),
  machines: z
    .string({ message: "List at least one machine type and material." })
    .trim()
    .min(1, { message: "List at least one machine type and material." })
    .max(4000, { message: "Use 4,000 characters or fewer." }),
  notes: optionalText(4000, "Use 4,000 characters or fewer."),
});

export const pilotRequestIdSchema = z.object({
  id: z.string().uuid({ message: "Not a valid request id." }),
});

export const listPilotRequestsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});
