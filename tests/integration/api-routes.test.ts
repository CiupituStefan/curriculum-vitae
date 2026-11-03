import { describe, expect, it } from "vitest";
import { GET as cv } from "@/app/api/cv/[locale]/[format]/route";
import { GET as health } from "@/app/api/health/route";

/* Route handlers exercised directly, in fallback mode (no database configured). */
const call = (locale: string, format: string, query = "") =>
  cv(new Request(`http://localhost/api/cv/${locale}/${format}${query}`), { params: Promise.resolve({ locale, format }) });

describe("GET /api/cv/[locale]/[format]", () => {
  it("returns a downloadable PDF", async () => {
    const response = await call("en", "ats");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="Stefan-Emanuel-Ciupitu-CV-ats-en.pdf"');
    const body = new Uint8Array(await response.arrayBuffer());
    expect(new TextDecoder().decode(body.subarray(0, 5))).toBe("%PDF-");
  });
  it("supports inline preview", async () => {
    const response = await call("ro", "modern", "?inline=1");
    expect(response.headers.get("content-disposition")).toMatch(/^inline;/);
  });
  it.each([
    ["de", "modern"],
    ["ro", "docx"],
    ["..", "modern"],
    ["ro", "../../etc/passwd"],
  ])("rejects %s/%s with 404", async (locale, format) => {
    expect((await call(locale, format)).status).toBe(404);
  });
});

describe("GET /api/health", () => {
  it("reports status without leaking internals", async () => {
    const response = await health();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Object.keys(json).sort()).toEqual(["database", "status", "time"]);
    expect(json.database).toBe("unconfigured");
  });
});
