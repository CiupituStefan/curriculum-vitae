import { describe, expect, it } from "vitest";
import { SECTION_KEYS, parseSection, sectionSchemas } from "@/domain/content/schema";
import { safeUrl } from "@/domain/content/primitives";
import { seedContent } from "@/domain/content/seed";
import { projectSchema } from "@/domain/projects/schema";
import { seedProjects } from "@/domain/projects/seed";
import { contactInputSchema, spamVerdict, MIN_FILL_MS } from "@/domain/contact/schema";
import { negotiateLocale, t } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatMonth, formatPeriod } from "@/lib/format";
import { SECTION_FORMS } from "@/components/admin/section-forms";

describe("seed content", () => {
  it.each(SECTION_KEYS)("section %s validates against its schema", (key) => {
    const result = parseSection(key, seedContent[key]);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
  it("every project validates and slugs are unique", () => {
    for (const project of seedProjects) expect(projectSchema.safeParse(project).success).toBe(true);
    expect(new Set(seedProjects.map((p) => p.slug)).size).toBe(seedProjects.length);
  });
  it("every localized string is filled in both languages or in neither", () => {
    const walk = (value: unknown, path: string) => {
      if (value && typeof value === "object" && "ro" in value && "en" in value && Object.keys(value).length === 2) {
        const { ro, en } = value as { ro: string; en: string };
        expect(Boolean(ro), `${path} RO/EN mismatch`).toBe(Boolean(en));
        return;
      }
      if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    };
    walk(seedContent, "content");
    walk(seedProjects, "projects");
  });
  it("keeps the phone number private by default", () => {
    expect(seedContent.contact.showPhone).toBe(false);
    expect(seedContent.contact.showPhoneInPdf).toBe(false);
  });
  it("has an admin form for every section", () => {
    expect(Object.keys(SECTION_FORMS).sort()).toEqual([...SECTION_KEYS].sort());
    expect(Object.keys(sectionSchemas).length).toBe(13);
  });
});

describe("validation", () => {
  it.each(["javascript:alert(1)", "data:text/html,x", "vbscript:x", "not a url", "//evil.com"])("rejects unsafe URL %s", (url) => {
    expect(safeUrl.safeParse(url).success).toBe(false);
  });
  it("accepts http(s) URLs", () => {
    expect(safeUrl.safeParse("https://github.com/CiupituStefan").success).toBe(true);
  });
  it("rejects oversized and malformed sections", () => {
    expect(parseSection("profile", { ...seedContent.profile, fullName: "x".repeat(500) }).success).toBe(false);
    expect(parseSection("experience", [{ ...seedContent.experience[0], start: "2026-13" }]).success).toBe(false);
    expect(parseSection("contact", { ...seedContent.contact, linkedin: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("contact form rules", () => {
  const valid = { name: "Ana Pop", email: "ana@example.com", subject: "", message: "Bună ziua, aș dori să discutăm.", consent: true, locale: "ro", website: "", startedAt: 0 };
  it("accepts a valid message", () => expect(contactInputSchema.safeParse(valid).success).toBe(true));
  it("requires consent and a real email", () => {
    expect(contactInputSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(contactInputSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
  it("flags honeypot and too-fast submissions only", () => {
    const now = 1_000_000;
    expect(spamVerdict({ website: "http://spam", startedAt: now - 10_000 }, now)).toBe("honeypot");
    expect(spamVerdict({ website: "", startedAt: now - MIN_FILL_MS + 1 }, now)).toBe("too_fast");
    expect(spamVerdict({ website: "", startedAt: now - 10_000 }, now)).toBe("ok");
    // A form left open for days must still be accepted (no silent loss of real messages).
    expect(spamVerdict({ website: "", startedAt: 0 }, now + 2 * 86_400_000)).toBe("ok");
  });
});

describe("i18n", () => {
  it("negotiates Accept-Language", () => {
    expect(negotiateLocale("en-GB,en;q=0.9,ro;q=0.8")).toBe("en");
    expect(negotiateLocale("de-DE,ro;q=0.5")).toBe("ro");
    expect(negotiateLocale("fr-FR")).toBe("ro");
    expect(negotiateLocale(null)).toBe("ro");
  });
  it("falls back to the other language when one is empty", () => {
    expect(t({ ro: "", en: "Hello" }, "ro")).toBe("Hello");
  });
  it("has the same dictionary keys in both languages", () => {
    const keys = (o: object, p = ""): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
    expect(keys(getDictionary("en"))).toEqual(keys(getDictionary("ro")));
  });
  it("formats periods in both languages", () => {
    expect(formatMonth("2026-01", "ro")).toBe("ian. 2026");
    expect(formatMonth("2026-01", "en")).toBe("Jan 2026");
    expect(formatPeriod("2025-09", "", "en", "present")).toBe("Sep 2025 – present");
    expect(formatPeriod("", "", "ro", "prezent", false)).toBe("");
  });
});
