/**
 * Open-redirect protection: only same-origin, absolute-path redirects are allowed.
 * Rejects protocol-relative ("//evil.com"), backslash tricks ("/\\evil.com") and absolute URLs.
 */
export function safeRedirectPath(candidate: unknown, fallback = "/admin"): string {
  if (typeof candidate !== "string") return fallback;
  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) return fallback;
  if (/[\u0000-\u001f]/.test(candidate)) return fallback;
  try {
    const url = new URL(candidate, "https://placeholder.invalid");
    if (url.origin !== "https://placeholder.invalid") return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
