/*
 * File upload validation. The real type of a file is determined from its leading bytes
 * ("magic numbers"); the client-declared MIME type and the file extension are never trusted.
 */

export type DetectedType = "jpeg" | "png" | "webp" | "avif" | "pdf";
export type UploadPurpose = "image" | "document";

export const UPLOAD_LIMITS = {
  /** Vercel Functions accept request bodies up to 4.5 MB; keep a margin. */
  image: { maxBytes: 4 * 1024 * 1024, types: ["jpeg", "png", "webp", "avif"] as DetectedType[] },
  document: { maxBytes: 4 * 1024 * 1024, types: ["pdf"] as DetectedType[] },
} as const;

/** Maximum decoded image size, protects against decompression bombs. */
export const MAX_IMAGE_PIXELS = 40_000_000;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

export function detectFileType(bytes: Uint8Array): DetectedType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "webp";
  if (ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "avif";
  if (ascii(bytes, 0, 5) === "%PDF-") return "pdf";
  return null;
}

/**
 * Heuristic scan for active content in PDFs (scripts, auto-launch actions, embedded files).
 * PDFs are attachments meant to be read, so any of these markers is rejected outright.
 * This is a defence-in-depth measure, not a substitute for an antivirus engine.
 */
const PDF_ACTIVE_CONTENT = [/\/JavaScript\b/, /\/JS\b/, /\/Launch\b/, /\/EmbeddedFile\b/, /\/OpenAction\b/, /\/AA\b/, /\/RichMedia\b/, /\/XFA\b/];

export function pdfHasActiveContent(bytes: Uint8Array): boolean {
  const text = new TextDecoder("latin1").decode(bytes);
  return PDF_ACTIVE_CONTENT.some((pattern) => pattern.test(text));
}

export type ValidationOutcome =
  | { ok: true; type: DetectedType }
  | { ok: false; reason: "empty" | "too_large" | "unsupported_type" | "active_content" };

export function validateUpload(bytes: Uint8Array, purpose: UploadPurpose): ValidationOutcome {
  const limits = UPLOAD_LIMITS[purpose];
  if (bytes.length === 0) return { ok: false, reason: "empty" };
  if (bytes.length > limits.maxBytes) return { ok: false, reason: "too_large" };
  const type = detectFileType(bytes);
  if (!type || !limits.types.includes(type)) return { ok: false, reason: "unsupported_type" };
  if (type === "pdf" && pdfHasActiveContent(bytes)) return { ok: false, reason: "active_content" };
  return { ok: true, type };
}

/**
 * Display name for an attachment. Storage keys are random UUIDs generated on the server; this
 * name is only shown in the UI and used as the download filename.
 */
export function sanitizeFileName(name: string, fallback = "document.pdf"): string {
  const base = name.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .normalize("NFC")
    .replace(/[^\p{L}\p{N} ._()-]/gu, "")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 100);
  return cleaned.length > 0 ? cleaned : fallback;
}
