import { describe, expect, it } from "vitest";
import { detectFileType, pdfHasActiveContent, sanitizeFileName, validateUpload, UPLOAD_LIMITS } from "@/lib/security/file-validation";
import { safeRedirectPath } from "@/lib/security/redirect";
import { buildCsp } from "@/lib/security/csp";
import { clientIp, pseudonymize } from "@/lib/security/hash";
import { redact } from "@/lib/logger";

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => new TextEncoder().encode(text);

describe("file validation (magic bytes, not extensions)", () => {
  it("detects real image and PDF signatures", () => {
    expect(detectFileType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
    expect(detectFileType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(detectFileType(ascii("RIFF\0\0\0\0WEBPVP8 "))).toBe("webp");
    expect(detectFileType(ascii("\0\0\0\x1cftypavif"))).toBe("avif");
    expect(detectFileType(ascii("%PDF-1.7\n"))).toBe("pdf");
  });
  it("rejects disguised files (HTML / SVG / executables renamed to .jpg)", () => {
    expect(validateUpload(ascii("<html><script>alert(1)</script>"), "image")).toEqual({ ok: false, reason: "unsupported_type" });
    expect(validateUpload(ascii('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'), "image")).toEqual({ ok: false, reason: "unsupported_type" });
    expect(validateUpload(ascii("MZ\x90\0"), "document")).toEqual({ ok: false, reason: "unsupported_type" });
  });
  it("does not accept a PDF as an image or an image as a document", () => {
    expect(validateUpload(ascii("%PDF-1.4"), "image").ok).toBe(false);
    expect(validateUpload(bytes(0xff, 0xd8, 0xff), "document").ok).toBe(false);
  });
  it("enforces size limits and rejects empty files", () => {
    expect(validateUpload(new Uint8Array(0), "image")).toEqual({ ok: false, reason: "empty" });
    const big = new Uint8Array(UPLOAD_LIMITS.image.maxBytes + 1);
    big.set([0xff, 0xd8, 0xff]);
    expect(validateUpload(big, "image")).toEqual({ ok: false, reason: "too_large" });
  });
  it("rejects PDFs with active content", () => {
    expect(pdfHasActiveContent(ascii("%PDF-1.4 1 0 obj << /OpenAction << /S /JavaScript /JS (app.alert(1)) >> >>"))).toBe(true);
    expect(validateUpload(ascii("%PDF-1.4 << /Launch /F (cmd.exe) >>"), "document")).toEqual({ ok: false, reason: "active_content" });
    expect(validateUpload(ascii("%PDF-1.4 plain text document"), "document")).toEqual({ ok: true, type: "pdf" });
  });
  it("sanitizes display file names (path traversal, control chars, markup)", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFileName("C:\\Users\\x\\Documentație ștefan.pdf")).toBe("Documentație ștefan.pdf");
    expect(sanitizeFileName('<img src=x onerror=alert(1)>.pdf')).toBe("img srcx onerroralert(1).pdf");
    expect(sanitizeFileName("...")).toBe("document.pdf");
  });
});

describe("open redirect protection", () => {
  it.each([
    ["/admin/projects", "/admin/projects"],
    ["/admin?x=1", "/admin?x=1"],
    ["//evil.com", "/admin"],
    ["/\\evil.com", "/admin"],
    ["https://evil.com", "/admin"],
    ["javascript:alert(1)", "/admin"],
    ["/admin\u0000", "/admin"],
    [undefined, "/admin"],
  ])("%s → %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});

describe("content security policy", () => {
  const csp = buildCsp("abc123", { dev: false, https: true, supabaseOrigin: "https://x.supabase.co" });
  it("locks scripts to the nonce and forbids framing, plugins and base hijacking", () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("img-src 'self' data: blob: https://x.supabase.co");
  });
  it("allows eval only in development", () => {
    expect(buildCsp("n", { dev: true })).toContain("'unsafe-eval'");
  });
});

describe("privacy helpers", () => {
  it("pseudonymizes IPs deterministically and irreversibly", () => {
    const a = pseudonymize("203.0.113.7", "salt-salt-salt-salt");
    expect(a).toHaveLength(32);
    expect(a).not.toContain("203");
    expect(pseudonymize("203.0.113.7", "salt-salt-salt-salt")).toBe(a);
    expect(pseudonymize("203.0.113.7", "another-salt-value!")).not.toBe(a);
  });
  it("reads the first forwarded IP", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers())).toBe("unknown");
  });
  it("redacts secrets and personal data from logs", () => {
    const out = redact({ password: "hunter2", apiKey: "sk_x", email: "a@b.ro", note: "contact a@b.ro now", nested: { token: "t" } }) as Record<string, unknown>;
    expect(out.password).toBe("[redacted]");
    expect(out.apiKey).toBe("[redacted]");
    expect(out.email).toBe("[redacted]");
    expect(out.note).toBe("contact [email] now");
    expect((out.nested as Record<string, unknown>).token).toBe("[redacted]");
  });
});
