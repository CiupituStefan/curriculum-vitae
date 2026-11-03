"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { toErrorCode } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { safeRedirectPath } from "@/lib/security/redirect";
import { isMfaPending } from "@/server/auth";
import { verifyLoginCode } from "@/server/services/mfa-service";
import { enforceRateLimits } from "@/server/services/rate-limit-service";
import { sessionClient } from "@/server/supabase/clients";

export type LoginState = { error?: "invalid" | "rate_limited" | "unavailable" | "forbidden" };
export type MfaState = { error?: "invalid_code" | "rate_limited" | "unavailable" };

const credentials = z.object({ email: z.email().max(254), password: z.string().min(8).max(200) });

/**
 * Password sign-in through Supabase Auth. Rate-limited per (pseudonymised) IP, per target account
 * and globally, so rotating IP addresses does not enable brute force. Generic error messages (no
 * account enumeration), MFA step when enrolled, admin membership verified before the session is
 * kept, and the post-login redirect is restricted to same-origin paths (no open redirect).
 */
export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) return { error: "unavailable" };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "invalid" };
  const next = safeRedirectPath(formData.get("next"), "/admin");

  try {
    await enforceRateLimits(
      { bucket: "login", by: "ip", headers: await headers() },
      { bucket: "loginAccount", by: "account", account: parsed.data.email },
      { bucket: "loginGlobal", by: "global" },
    );
  } catch (error) {
    if (toErrorCode(error) === "rate_limited") logger.warn("auth.login_rate_limited");
    return { error: toErrorCode(error) === "rate_limited" ? "rate_limited" : "unavailable" };
  }

  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    logger.warn("auth.login_failed", { reason: error.code ?? "unknown" });
    return { error: "invalid" };
  }
  if (await isMfaPending()) {
    redirect(`/admin/login/mfa?next=${encodeURIComponent(next)}`);
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    logger.warn("auth.login_not_admin");
    return { error: "forbidden" };
  }
  logger.info("auth.login_succeeded");
  redirect(next);
}

/** Second factor (TOTP) during login. */
export async function verifyMfaAction(_previous: MfaState, formData: FormData): Promise<MfaState> {
  const next = safeRedirectPath(formData.get("next"), "/admin");
  try {
    await verifyLoginCode(String(formData.get("code") ?? "").replace(/\s+/g, ""));
  } catch (error) {
    const code = toErrorCode(error);
    if (code === "unauthorized") redirect("/admin/login");
    return { error: code === "rate_limited" ? "rate_limited" : code === "validation" ? "invalid_code" : "unavailable" };
  }
  const supabase = await sessionClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }
  redirect(next);
}
