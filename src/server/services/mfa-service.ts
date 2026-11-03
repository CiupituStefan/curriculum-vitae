import "server-only";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getCurrentUser, isMfaPending, requireAdmin } from "@/server/auth";
import { sessionClient } from "@/server/supabase/clients";
import { enforceRateLimits } from "./rate-limit-service";
import { recordSecurityEvent } from "./security-events";

/*
 * TOTP multi-factor authentication for the administrator (Supabase Auth MFA).
 * Once a factor is verified, both the app (requireAdmin → isMfaPending) and the database
 * (public.is_admin() checks the JWT "aal" claim) require an aal2 session for admin access.
 */

const CODE = /^\d{6}$/;

export type MfaFactor = { id: string; friendlyName: string; createdAt: string };
export type MfaStatus = { enabled: boolean; factors: MfaFactor[] };

export async function getMfaStatus(): Promise<MfaStatus> {
  await requireAdmin();
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new AppError("internal", error.message);
  const factors = data.totp.map((f) => ({ id: f.id, friendlyName: f.friendly_name ?? "TOTP", createdAt: f.created_at }));
  return { enabled: factors.length > 0, factors };
}

/** Starts TOTP enrollment. Returns the QR code (data URL) and the secret for manual entry. */
export async function startEnrollment(): Promise<{ factorId: string; qrCode: string; secret: string }> {
  await requireAdmin();
  const supabase = await sessionClient();
  // Remove abandoned, unverified enrollments so they do not accumulate.
  const { data: list } = await supabase.auth.mfa.listFactors();
  for (const factor of list?.all ?? []) {
    if (factor.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Admin ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) throw new AppError("internal", error?.message ?? "enroll failed");
  return {
    factorId: data.id,
    qrCode: `data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`,
    secret: data.totp.secret,
  };
}

async function verifyCode(factorId: string, code: string, email: string): Promise<void> {
  if (!CODE.test(code)) throw new AppError("validation", "invalid_code");
  await enforceRateLimits({ bucket: "mfaAccount", by: "account", account: email });
  const supabase = await sessionClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) {
    logger.warn("auth.mfa_verify_failed", { reason: error.code ?? "unknown" });
    await recordSecurityEvent("auth.mfa_verify_failed", { reason: error.code ?? "unknown" });
    throw new AppError("validation", "invalid_code");
  }
}

/** Confirms a new enrollment with a first code; the session is upgraded to aal2. */
export async function confirmEnrollment(factorId: string, code: string): Promise<void> {
  const { user } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(factorId)) throw new AppError("validation");
  await verifyCode(factorId, code, user.email ?? user.id);
  logger.info("auth.mfa_enrolled");
  await recordSecurityEvent("auth.mfa_enrolled", {}, { actor: user.id });
}

/** Second login step: verifies the code for the account's verified TOTP factor. */
export async function verifyLoginCode(code: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("unauthorized");
  if (!(await isMfaPending())) return;
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp[0];
  if (error || !factor) throw new AppError("internal", "no verified factor");
  await verifyCode(factor.id, code, user.email ?? user.id);
  logger.info("auth.mfa_login_succeeded");
  await recordSecurityEvent("auth.mfa_login_succeeded", {}, { actor: user.id });
}

/** Removes a factor. Requires an aal2 session (enforced by requireAdmin while MFA is enabled). */
export async function removeFactor(factorId: string): Promise<void> {
  const { user } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(factorId)) throw new AppError("validation");
  const supabase = await sessionClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new AppError("internal", error.message);
  logger.warn("auth.mfa_removed");
  await recordSecurityEvent("auth.mfa_removed", {}, { actor: user.id });
}
