import { timingSafeEqual } from "node:crypto";
import { logger } from "@/lib/logger";
import { messageRepository } from "@/server/repositories/message-repository";
import { serviceClient } from "@/server/supabase/clients";
import { serverEnv } from "@/server/env.server";
import { recordSecurityEvent } from "@/server/services/security-events";

export const dynamic = "force-dynamic";

function authorized(header: string | null): boolean {
  const secret = serverEnv.CRON_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/**
 * Daily data-retention job (Vercel Cron, see vercel.json). Deletes contact messages older than
 * CONTACT_RETENTION_DAYS and expired rate-limit counters. Requires `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const deleted = await messageRepository.purgeExpired(serviceClient(), serverEnv.CONTACT_RETENTION_DAYS);
    logger.info("retention.purged", { deleted });
    await recordSecurityEvent("retention.purged", { deleted });
    return Response.json({ ok: true, deleted });
  } catch (error) {
    logger.error("retention.failed", { error });
    return Response.json({ ok: false }, { status: 500 });
  }
}
