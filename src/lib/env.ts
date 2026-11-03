import { z } from "zod";

/*
 * Centralised, validated access to configuration. Secrets are only read on the server
 * (see server/env.server.ts). This module is safe to import from client code because it only
 * touches NEXT_PUBLIC_* variables, which are intentionally public.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("https://ciupiustefan.com"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20).optional(),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
});

if (!parsed.success) {
  throw new Error(`Invalid public environment configuration: ${parsed.error.message}`);
}

export const publicEnv = parsed.data;

export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
