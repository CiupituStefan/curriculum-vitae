import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Service-layer integration tests: real validation, spam, rate-limit and authorization logic,
 * with the Supabase data-access boundary replaced by in-memory fakes.
 */
const state = vi.hoisted(() => ({
  user: null as null | { id: string; email: string },
  admin: false,
  inserted: [] as unknown[],
  upserts: [] as unknown[],
  allow: true,
}));

vi.mock("@/server/env.server", () => ({
  serverEnv: { IP_HASH_SALT: "test-salt-test-salt", SUPABASE_SECRET_KEY: "x".repeat(30), CONTACT_RETENTION_DAYS: 180 },
}));
vi.mock("@/lib/env", () => ({ isSupabaseConfigured: () => true, siteUrl: "https://ciupitustefan.com", publicEnv: {} }));
vi.mock("@/server/supabase/clients", () => ({
  publicClient: () => ({}),
  serviceClient: () => ({}),
  sessionClient: async () => ({}),
}));
vi.mock("@/server/auth", async () => {
  const { AppError } = await import("@/lib/errors");
  return {
    requireAdmin: async () => {
      if (!state.user) throw new AppError("unauthorized");
      if (!state.admin) throw new AppError("forbidden");
      return { user: state.user };
    },
  };
});
vi.mock("@/server/repositories/message-repository", () => ({
  messageRepository: {
    insert: async (_db: unknown, row: unknown) => void state.inserted.push(row),
    hitRateLimit: async () => state.allow,
    list: async () => [],
    remove: async () => undefined,
  },
}));
vi.mock("@/server/repositories/content-repository", () => ({
  contentRepository: { upsertSection: async (_db: unknown, key: string, value: unknown) => void state.upserts.push({ key, value }) },
}));
vi.mock("@/server/services/email-service", () => ({ sendContactNotification: async () => false }));

import { submitContact, listMessages } from "@/server/services/contact-service";
import { saveSection } from "@/server/services/content-service";
import { seedContent } from "@/domain/content/seed";
import { AppError } from "@/lib/errors";

const headers = new Headers({ "x-forwarded-for": "198.51.100.7" });
const valid = () => ({ name: "Ana Pop", email: "ana@example.com", subject: "Job", message: "Bună ziua! Aș dori să discutăm despre un rol.", consent: true, locale: "ro", website: "", startedAt: Date.now() - 10_000 });

beforeEach(() => {
  state.user = null;
  state.admin = false;
  state.inserted = [];
  state.upserts = [];
  state.allow = true;
});

describe("contact service", () => {
  it("stores a valid message", async () => {
    await expect(submitContact(valid(), headers)).resolves.toEqual({ delivered: true });
    expect(state.inserted).toHaveLength(1);
    expect(state.inserted[0]).not.toHaveProperty("website");
  });
  it("returns field errors for invalid input and stores nothing", async () => {
    const error = await submitContact({ ...valid(), email: "bad", message: "short" }, headers).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("validation");
    expect(error.fieldErrors).toMatchObject({ email: "email_invalid", message: "message_short" });
    expect(state.inserted).toHaveLength(0);
  });
  it("silently drops honeypot submissions", async () => {
    await expect(submitContact({ ...valid(), website: "http://spam" }, headers)).resolves.toEqual({ delivered: true });
    expect(state.inserted).toHaveLength(0);
  });
  it("rejects too-fast submissions visibly instead of dropping them", async () => {
    await expect(submitContact({ ...valid(), startedAt: Date.now() }, headers)).rejects.toMatchObject({ code: "too_fast" });
    expect(state.inserted).toHaveLength(0);
  });
  it("enforces the rate limit", async () => {
    state.allow = false;
    await expect(submitContact(valid(), headers)).rejects.toMatchObject({ code: "rate_limited" });
    expect(state.inserted).toHaveLength(0);
  });
  it("does not let visitors read messages", async () => {
    await expect(listMessages()).rejects.toMatchObject({ code: "unauthorized" });
  });
});

describe("content service authorization", () => {
  it("rejects anonymous writes", async () => {
    await expect(saveSection("seo", seedContent.seo)).rejects.toMatchObject({ code: "unauthorized" });
    expect(state.upserts).toHaveLength(0);
  });
  it("rejects authenticated non-admin writes (no privilege escalation)", async () => {
    state.user = { id: "u1", email: "u@example.com" };
    await expect(saveSection("seo", seedContent.seo)).rejects.toMatchObject({ code: "forbidden" });
    expect(state.upserts).toHaveLength(0);
  });
  it("validates admin writes on the server", async () => {
    state.user = { id: "a1", email: "a@example.com" };
    state.admin = true;
    await expect(saveSection("seo", { title: { ro: "", en: "" } })).rejects.toMatchObject({ code: "validation" });
    await saveSection("seo", seedContent.seo);
    expect(state.upserts).toEqual([{ key: "seo", value: seedContent.seo }]);
  });
});
