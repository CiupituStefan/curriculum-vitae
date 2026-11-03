import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/server/env.server";
import { AppError } from "@/lib/errors";

/*
 * Three clients, three trust levels (least privilege):
 *  - publicClient():  publishable key, no session. Subject to RLS as `anon`. Used for public reads.
 *  - sessionClient(): publishable key + the visitor's auth cookies. Subject to RLS as the user.
 *                     All admin writes go through this client, so RLS is a second line of
 *                     defence behind the server-side `requireAdmin()` check.
 *  - serviceClient(): secret key, bypasses RLS. Used ONLY for narrowly-scoped server tasks that
 *                     have no user session: contact-form inserts, rate limiting and retention.
 */

function requireConfig() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const key = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new AppError("unavailable", "Supabase is not configured");
  return { url, key };
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

let cachedPublic: SupabaseClient | undefined;
export function publicClient(): SupabaseClient {
  const { url, key } = requireConfig();
  cachedPublic ??= createClient(url, key, noSession);
  return cachedPublic;
}

export async function sessionClient(): Promise<SupabaseClient> {
  const { url, key } = requireConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes them.
        }
      },
    },
  });
}

let cachedService: SupabaseClient | undefined;
export function serviceClient(): SupabaseClient {
  const { url } = requireConfig();
  const secret = serverEnv.SUPABASE_SECRET_KEY;
  if (!secret) throw new AppError("unavailable", "Supabase secret key is not configured");
  cachedService ??= createClient(url, secret, noSession);
  return cachedService;
}
