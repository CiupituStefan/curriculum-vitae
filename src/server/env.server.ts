import "server-only";
import { z } from "zod";

/** Server-only secrets. Importing this file from a Client Component fails the build. */
const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(20).optional(),
  RESEND_API_KEY: z.string().min(10).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
  IP_HASH_SALT: z.string().min(16).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  CONTACT_RETENTION_DAYS: z.coerce.number().int().min(1).max(730).default(180),
});

const parsed = serverSchema.safeParse(
  Object.fromEntries(Object.keys(serverSchema.shape).map((key) => [key, process.env[key] || undefined])),
);

if (!parsed.success) {
  // Never print values: only the names of the invalid variables.
  const names = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Invalid server environment configuration for: ${names}`);
}

export const serverEnv = parsed.data;
