import "server-only";
import { AppError } from "@/lib/errors";
import { clientIp, pseudonymize } from "@/lib/security/hash";
import { messageRepository } from "@/server/repositories/message-repository";
import { serviceClient } from "@/server/supabase/clients";
import { serverEnv } from "@/server/env.server";

export const RATE_LIMITS = {
  contact: { limit: 5, windowSeconds: 60 * 60 },
  login: { limit: 10, windowSeconds: 15 * 60 },
} as const;

/**
 * Distributed fixed-window rate limiting backed by Postgres (works across serverless instances).
 * The client IP is pseudonymised with a keyed HMAC before it is stored. Fails closed: if the
 * limiter cannot be consulted, the request is rejected.
 */
export async function enforceRateLimit(bucket: keyof typeof RATE_LIMITS, headers: Headers): Promise<void> {
  const salt = serverEnv.IP_HASH_SALT;
  if (!salt) throw new AppError("unavailable", "IP_HASH_SALT is not configured");
  const { limit, windowSeconds } = RATE_LIMITS[bucket];
  const key = `${bucket}:${pseudonymize(clientIp(headers), salt)}`;
  const allowed = await messageRepository.hitRateLimit(serviceClient(), key, limit, windowSeconds);
  if (!allowed) throw new AppError("rate_limited");
}
