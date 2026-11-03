import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, negotiateLocale } from "@/i18n/config";
import { buildCsp } from "@/lib/security/csp";

/*
 * Request pipeline (runs before every page render):
 *  1. Locale routing: unprefixed paths are redirected to /ro/... or /en/...
 *  2. Per-request CSP nonce.
 *  3. Supabase session refresh and a first-line redirect for unauthenticated /admin visits.
 *     This is a UX convenience only: every admin page and Server Action re-verifies the user
 *     server side (requireAdmin) and the database enforces RLS.
 */

const LOCALE_COOKIE = "NEXT_LOCALE";

function supabaseOrigin(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : undefined;
  } catch {
    return undefined;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";
  const isAdmin = firstSegment === "admin";

  if (!isAdmin && !isLocale(firstSegment)) {
    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(cookieLocale) ? cookieLocale : negotiateLocale(request.headers.get("accept-language"));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
  const csp = buildCsp(nonce, {
    dev: process.env.NODE_ENV === "development",
    https: request.nextUrl.protocol === "https:",
    supabaseOrigin: supabaseOrigin(),
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.set("x-locale", isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (isAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    let authenticated = false;
    if (url && key) {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (toSet) => {
            for (const { name, value } of toSet) request.cookies.set(name, value);
            response = NextResponse.next({ request: { headers: requestHeaders } });
            for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
          },
        },
      });
      const { data } = await supabase.auth.getUser();
      authenticated = Boolean(data.user);
    }
    const isLogin = pathname === "/admin/login";
    if (!authenticated && !isLogin) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.search = "";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login, 307);
    }
  } else if (isLocale(firstSegment)) {
    response.cookies.set(LOCALE_COOKIE, firstSegment, { path: "/", sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 365 });
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|images|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|pdf|txt|xml)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
