import { z } from "zod";

// All environment access goes through here, validated once at startup.
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Optional so the API still boots without a database: every query then
  // answers 503 and the website falls back to its dummy data.
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a postgres:// connection URL." }).optional(),
  // Direct (non-pooler) URL, as Neon provides it. Preferred when set: Neon's
  // pooler rejects the search_path startup option the pool relies on.
  DATABASE_URL_UNPOOLED: z
    .string()
    .url({ message: "DATABASE_URL_UNPOOLED must be a postgres:// connection URL." })
    .optional(),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  // Optional. When unset, admin endpoints answer 503 instead of being open.
  ADMIN_API_KEY: z.string().min(16, { message: "ADMIN_API_KEY must be at least 16 characters." }).optional(),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  // Pilot form submissions allowed per client IP per window.
  PILOT_RATE_LIMIT: z.coerce.number().int().min(1).default(10),
  PILOT_RATE_WINDOW_MINUTES: z.coerce.number().int().min(1).default(10),
  LOG_REQUESTS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment:\n${lines.join("\n")}`);
  }
  return Object.freeze(parsed.data);
}

export const config = load();
export const isProduction = config.NODE_ENV === "production";
