import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { sessionClient } from "@/server/supabase/clients";

export type AdminSession = { user: Pick<User, "id" | "email"> };

/**
 * Returns the authenticated user, verified against Supabase Auth (getUser() validates the JWT
 * with the auth server; the cookie alone is never trusted).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

/** Whether the current user is in `public.admin_users` (checked by a SECURITY DEFINER SQL function). */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  const supabase = await sessionClient();
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
});

/**
 * Authorization guard. MUST be called at the start of every Server Action / Route Handler that
 * mutates data or reads private data. Hiding UI is never treated as access control.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("unauthorized");
  if (!(await isCurrentUserAdmin())) throw new AppError("forbidden");
  return { user: { id: user.id, email: user.email } };
}
