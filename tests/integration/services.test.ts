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
  patterns: [] as string[],
  privates: [] as unknown[],
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
    listByEmail: async (_db: unknown, pattern: string) => {
      state.patterns.push(pattern);
      return [];
    },
    removeByEmail: async (_db: unknown, pattern: string) => {
      state.patterns.push(pattern);
      return 0;
    },
    hitRateLimit: async () => state.allow,
    list: async () => [],
    remove: async () => undefined,
  },
}));
vi.mock("@/server/repositories/content-repository", () => ({
  contentRepository: {
    upsertSection: async (_db: unknown, key: string, value: unknown) => void state.upserts.push({ key, value }),
    upsertPrivate: async (_db: unknown, key: string, value: unknown) => void state.privates.push({ key, value }),
  },
}));
vi.mock("@/server/services/email-service", () => ({ sendContactNotification: async () => false }));
vi.mock("@/server/services/security-events", () => ({ recordSecurityEvent: async () => undefined }));

import { deleteMessagesByEmail, findMessagesByEmail, submitContact, listMessages } from "@/server/services/contact-service";
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
  state.patterns = [];
  state.privates = [];
});

describe("contact service", () => {
  it("stores a valid message", async () => {
    await expect(submitContact(valid(), headers)).resolves.toEqual({ delivered: true });
    expect(state.inserted).toHaveLength(1);
    expect(state.inserted[0]).not.toHaveProperty("website");
    // Proof of consent (GDPR art. 7(1)) is stored with the message.
    expect(state.inserted[0]).toMatchObject({ privacy_version: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/), consent_at: expect.any(String) });
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

describe("data-subject requests", () => {
  it("are admin-only", async () => {
    await expect(findMessagesByEmail("ana@example.com")).rejects.toMatchObject({ code: "unauthorized" });
    state.user = { id: "u1", email: "u@example.com" };
    await expect(deleteMessagesByEmail("ana@example.com")).rejects.toMatchObject({ code: "forbidden" });
  });
  it("match one exact address: LIKE wildcards cannot select other people's data", async () => {
    state.user = { id: "a1", email: "a@example.com" };
    state.admin = true;
    await findMessagesByEmail("Ana_Pop@Example.com");
    expect(state.patterns).toEqual(["ana\\_pop@example.com"]);
    await expect(findMessagesByEmail("%@example.com")).rejects.toMatchObject({ code: "validation" });
    await expect(deleteMessagesByEmail("%")).rejects.toMatchObject({ code: "validation" });
  });
});

describe("unpublished data never reaches the public CV section (A.8.2.3 / A.18.1.4)", () => {
  const admin = () => {
    state.user = { id: "a1", email: "a@example.com" };
    state.admin = true;
  };
  it("keeps a hidden phone number only in the admin-only private table", async () => {
    admin();
    await saveSection("contact", { ...seedContent.contact, phone: "+40 700 000 000", showPhone: false, showPhoneInPdf: false });
    expect(state.upserts).toEqual([{ key: "contact", value: expect.objectContaining({ phone: "" }) }]);
    expect(state.privates).toEqual([{ key: "contact", value: { phone: "+40 700 000 000" } }]);
  });
  it("publishes the phone only when the owner opts in", async () => {
    admin();
    await saveSection("contact", { ...seedContent.contact, phone: "+40 700 000 000", showPhone: true, showPhoneInPdf: false });
    expect(state.upserts[0]).toEqual({ key: "contact", value: expect.objectContaining({ phone: "+40 700 000 000" }) });
    expect(state.privates).toEqual([{ key: "contact", value: { phone: "" } }]);
  });
});
