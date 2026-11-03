import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Layered rate limiting, with an in-memory counter standing in for the Postgres function.
 * Reproduces the bypass found in the 2026-11 audit: login attempts spread over many IPs.
 */
const counters = vi.hoisted(() => new Map<string, number>());

vi.mock("@/server/env.server", () => ({ serverEnv: { IP_HASH_SALT: "test-salt-test-salt" } }));
vi.mock("@/server/supabase/clients", () => ({ serviceClient: () => ({}) }));
vi.mock("@/server/repositories/message-repository", () => ({
  messageRepository: {
    hitRateLimit: async (_db: unknown, key: string, limit: number) => {
      const hits = (counters.get(key) ?? 0) + 1;
      counters.set(key, hits);
      return hits <= limit;
    },
  },
}));

import { RATE_LIMITS, enforceRateLimits } from "@/server/services/rate-limit-service";

const fromIp = (ip: string) => new Headers({ "x-forwarded-for": ip });
const loginAttempt = (ip: string, account: string) =>
  enforceRateLimits(
    { bucket: "login", by: "ip", headers: fromIp(ip) },
    { bucket: "loginAccount", by: "account", account },
    { bucket: "loginGlobal", by: "global" },
  );

beforeEach(() => counters.clear());

describe("layered login rate limiting", () => {
  it("blocks a distributed brute force on one account even when every attempt uses a new IP", async () => {
    const limit = RATE_LIMITS.loginAccount.limit;
    for (let i = 0; i < limit; i++) await expect(loginAttempt(`203.0.113.${i}`, "admin@example.com")).resolves.toBeUndefined();
    await expect(loginAttempt("198.51.100.250", "admin@example.com")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("treats e-mail case and whitespace as the same account", async () => {
    for (let i = 0; i < RATE_LIMITS.loginAccount.limit; i++) await loginAttempt(`203.0.113.${i}`, "Admin@Example.com ");
    await expect(loginAttempt("198.51.100.1", "admin@example.com")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("still limits a single IP that rotates target accounts", async () => {
    for (let i = 0; i < RATE_LIMITS.login.limit; i++) await loginAttempt("192.0.2.9", `user${i}@example.com`);
    await expect(loginAttempt("192.0.2.9", "another@example.com")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("caps the total number of login attempts on the site", async () => {
    for (let i = 0; i < RATE_LIMITS.loginGlobal.limit; i++) await loginAttempt(`10.0.${Math.floor(i / 250)}.${i % 250}`, `u${i}@example.com`);
    await expect(loginAttempt("10.9.9.9", "fresh@example.com")).rejects.toMatchObject({ code: "rate_limited" });
  });

  it("never stores raw IPs or e-mail addresses in counter keys", async () => {
    await loginAttempt("203.0.113.77", "admin@example.com");
    for (const key of counters.keys()) {
      expect(key).not.toContain("203.0.113.77");
      expect(key).not.toContain("admin@example.com");
    }
  });
});
