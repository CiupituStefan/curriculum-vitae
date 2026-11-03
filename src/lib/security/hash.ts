import { createHmac } from "node:crypto";

/**
 * Pseudonymises an identifier (e.g. an IP address) with a keyed HMAC so that rate-limit keys
 * never contain raw personal data and cannot be reversed without the server-side salt.
 */
export function pseudonymize(value: string, salt: string): string {
  return createHmac("sha256", salt).update(value).digest("hex").slice(0, 32);
}

/** Client IP as seen by the platform edge. On Vercel, x-forwarded-for is set by the platform. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || "unknown";
}
