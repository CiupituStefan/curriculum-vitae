/** Builds the per-request Content-Security-Policy (nonce based, `strict-dynamic`). */
export function buildCsp(nonce: string, options: { dev: boolean; https?: boolean; supabaseOrigin?: string }): string {
  const supabase = options.supabaseOrigin ? ` ${options.supabaseOrigin}` : "";
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${options.dev ? " 'unsafe-eval'" : ""}`,
    // Inline style attributes are required by next/image and React; scripts remain nonce-locked.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:${supabase}`,
    `font-src 'self'`,
    `connect-src 'self'${options.dev ? " ws:" : ""}`,
    `media-src 'self'${supabase}`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
  ];
  if (options.https) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
