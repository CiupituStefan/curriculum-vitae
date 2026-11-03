import "server-only";
import { logger, redact } from "@/lib/logger";
import { clientIp, pseudonymize } from "@/lib/security/hash";
import { serverEnv } from "@/server/env.server";
import { serviceClient } from "@/server/supabase/clients";

/*
 * Persistent security event log (ISO/IEC 27001 A.12.4.1 event logging, A.12.4.3 administrator
 * logs). Rows are written only by the server with the service role and are read-only for the
 * administrator (RLS), so they cannot be forged or erased through the API. No personal data is
 * stored: identifiers are pseudonymised and details pass through the same redaction as logs.
 * Recording never breaks the user-facing operation: failures fall back to the platform log.
 */
export type SecurityEvent =
  | "auth.login_succeeded"
  | "auth.login_failed"
  | "auth.login_rate_limited"
  | "auth.login_not_admin"
  | "auth.mfa_enrolled"
  | "auth.mfa_removed"
  | "auth.mfa_login_succeeded"
  | "auth.mfa_verify_failed"
  | "auth.signed_out"
  | "admin.content_saved"
  | "admin.revision_restored"
  | "admin.project_created"
  | "admin.project_updated"
  | "admin.project_deleted"
  | "admin.file_uploaded"
  | "admin.file_removed"
  | "admin.message_deleted"
  | "privacy.data_exported"
  | "privacy.data_erased"
  | "contact.rate_limited"
  | "retention.purged";

export async function recordSecurityEvent(
  event: SecurityEvent,
  details: Record<string, unknown> = {},
  options: { actor?: string | null; headers?: Headers } = {},
): Promise<void> {
  const enriched: Record<string, unknown> = { ...(redact(details) as Record<string, unknown>) };
  if (options.headers && serverEnv.IP_HASH_SALT) {
    enriched.ipHash = pseudonymize(clientIp(options.headers), serverEnv.IP_HASH_SALT).slice(0, 12);
  }
  try {
    const { error } = await serviceClient().from("security_events").insert({ event, actor: options.actor ?? null, details: enriched });
    if (error) throw new Error(error.message);
  } catch (error) {
    logger.warn("security_event.record_failed", { event, error });
  }
}

export type SecurityEventRow = { id: number; at: string; event: string; actor: string | null; details: Record<string, unknown> };

/** Latest events for the administrator's periodic log review (A.12.4.1). */
export async function listSecurityEvents(limit = 200): Promise<SecurityEventRow[]> {
  const { requireAdmin } = await import("@/server/auth");
  const { sessionClient } = await import("@/server/supabase/clients");
  await requireAdmin();
  const { data, error } = await (await sessionClient())
    .from("security_events")
    .select("id, at, event, actor, details")
    .order("at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as SecurityEventRow[];
}
