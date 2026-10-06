import { z } from "zod";

export const slugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,64}$/, { message: "Unknown page." }),
});

export const assetCodeParamSchema = z.object({
  assetCode: z.string().regex(/^[A-Za-z0-9-]{1,32}$/, { message: "Unknown machine." }),
});

export const demoShiftQuerySchema = z.object({
  machine: z
    .string()
    .regex(/^[A-Za-z0-9-]{1,32}$/, { message: "Unknown machine." })
    .default("CR-04"),
});

export const shiftListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
