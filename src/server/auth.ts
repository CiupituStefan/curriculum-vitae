import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { sessionClient } from "@/server/supabase/clients";

export type AdminSession = { user: Pick<User, "id" | "email"> };

/** Authenticator Assurance Level of the current session (aal1 = password, aal2 = password + MFA). */
export type Assurance = { current: "aal1" | "aal2" | null; next: "aal1" | "aal2" | null };

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

export const getAssurance = cache(async (): Promise<Assurance> => {
  if (!(await getCurrentUser())) return { current: null, next: null };
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return { current: null, next: null };
  const level = (value: unknown) => (value === "aal1" || value === "aal2" ? value : null);
  return { current: level(data.currentLevel), next: level(data.nextLevel) };
});

/** True when the account has a verified MFA factor but this session has not passed it yet. */
export const isMfaPending = cache(async (): Promise<boolean> => {
  const { current, next } = await getAssurance();
  return next === "aal2" && current !== "aal2";
});

/**
 * Whether the current user is in `public.admin_users` (checked by a SECURITY DEFINER SQL function
 * that also requires an aal2 session when the account has MFA enrolled).
 */
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
  if (await isMfaPending()) throw new AppError("unauthorized", "mfa_required");
  if (!(await isCurrentUserAdmin())) throw new AppError("forbidden");
  return { user: { id: user.id, email: user.email } };
}
