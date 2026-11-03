import "server-only";
import { AppError } from "@/lib/errors";
import { clientIp, pseudonymize } from "@/lib/security/hash";
import { messageRepository } from "@/server/repositories/message-repository";
import { serviceClient } from "@/server/supabase/clients";
import { serverEnv } from "@/server/env.server";

/*
 * Layered rate limits. A per-IP limit alone is bypassed by rotating IP addresses (proxies,
 * botnets — verified during the 2026-11 audit), so sensitive actions are also limited per
 * target account and globally.
 */
export const RATE_LIMITS = {
  /** Contact form, per client IP. */
  contact: { limit: 5, windowSeconds: 60 * 60 },
  /** Contact form, whole site: caps spam floods that rotate IPs. */
  contactGlobal: { limit: 50, windowSeconds: 24 * 60 * 60 },
  /** Login attempts, per client IP. */
  login: { limit: 10, windowSeconds: 15 * 60 },
  /** Login attempts against one e-mail address, from any IP (stops distributed brute force). */
  loginAccount: { limit: 10, windowSeconds: 15 * 60 },
  /** All login attempts on the site. */
  loginGlobal: { limit: 100, windowSeconds: 60 * 60 },
  /** MFA code verifications per account (6-digit TOTP codes must not be guessable). */
  mfaAccount: { limit: 5, windowSeconds: 15 * 60 },
} as const;

export type RateLimitBucket = keyof typeof RATE_LIMITS;

/** A rate-limit check: the bucket plus the subject it applies to (raw; pseudonymised here). */
export type RateLimitSubject =
  | { bucket: "contact" | "login"; by: "ip"; headers: Headers }
  | { bucket: "loginAccount" | "mfaAccount"; by: "account"; account: string }
  | { bucket: "contactGlobal" | "loginGlobal"; by: "global" };

function subjectKey(subject: RateLimitSubject, salt: string): string {
  if (subject.by === "global") return `${subject.bucket}:all`;
  const raw = subject.by === "ip" ? clientIp(subject.headers) : subject.account.trim().toLowerCase();
  return `${subject.bucket}:${pseudonymize(raw, salt)}`;
}

/**
 * Distributed fixed-window rate limiting backed by Postgres (works across serverless instances).
 * Identifiers (IP, e-mail) are pseudonymised with a keyed HMAC before they are stored.
 * Every subject is counted, then the request is rejected if ANY limit is exceeded.
 * Fails closed: if the limiter cannot be consulted, the request is rejected.
 */
export async function enforceRateLimits(...subjects: RateLimitSubject[]): Promise<void> {
  const salt = serverEnv.IP_HASH_SALT;
  if (!salt) throw new AppError("unavailable", "IP_HASH_SALT is not configured");
  const db = serviceClient();
  const results = await Promise.all(
    subjects.map((subject) => {
      const { limit, windowSeconds } = RATE_LIMITS[subject.bucket];
      return messageRepository.hitRateLimit(db, subjectKey(subject, salt), limit, windowSeconds);
    }),
  );
  if (results.some((allowed) => !allowed)) throw new AppError("rate_limited");
}

/** Per-IP limit only (kept for callers that have no account context). */
export async function enforceRateLimit(bucket: "contact" | "login", headers: Headers): Promise<void> {
  await enforceRateLimits({ bucket, by: "ip", headers });
}
