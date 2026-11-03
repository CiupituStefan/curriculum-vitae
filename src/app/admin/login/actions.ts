"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { toErrorCode } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { safeRedirectPath } from "@/lib/security/redirect";
import { enforceRateLimit } from "@/server/services/rate-limit-service";
import { sessionClient } from "@/server/supabase/clients";

export type LoginState = { error?: "invalid" | "rate_limited" | "unavailable" | "forbidden" };

const credentials = z.object({ email: z.email().max(254), password: z.string().min(8).max(200) });

/**
 * Password sign-in through Supabase Auth. Rate-limited per (pseudonymised) IP, generic error
 * messages (no account enumeration), admin membership verified before the session is kept,
 * and the post-login redirect is restricted to same-origin paths (no open redirect).
 */
export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) return { error: "unavailable" };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "invalid" };

  try {
    await enforceRateLimit("login", await headers());
  } catch (error) {
    return { error: toErrorCode(error) === "rate_limited" ? "rate_limited" : "unavailable" };
  }

  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    logger.warn("auth.login_failed", { reason: error.code ?? "unknown" });
    return { error: "invalid" };
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    logger.warn("auth.login_not_admin");
    return { error: "forbidden" };
  }
  logger.info("auth.login_succeeded");
  redirect(safeRedirectPath(formData.get("next"), "/admin"));
}
