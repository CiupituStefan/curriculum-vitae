import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string;
  created_at: string;
};

/** Data access for `public.contact_messages` and the rate-limit / retention SQL functions. */
export const messageRepository = {
  async insert(db: SupabaseClient, input: Omit<MessageRow, "id" | "created_at">): Promise<void> {
    const { error } = await db.from("contact_messages").insert(input);
    if (error) throw new AppError("internal", error.message);
  },

  async list(db: SupabaseClient): Promise<MessageRow[]> {
    const { data, error } = await db
      .from("contact_messages")
      .select("id, name, email, subject, message, locale, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new AppError("internal", error.message);
    return data ?? [];
  },

  async remove(db: SupabaseClient, id: string): Promise<void> {
    const { error } = await db.from("contact_messages").delete().eq("id", id);
    if (error) throw new AppError("internal", error.message);
  },

  /** Atomic fixed-window counter implemented in SQL (see migration). Returns true when allowed. */
  async hitRateLimit(db: SupabaseClient, key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw new AppError("unavailable", error.message);
    return data === true;
  },

  async purgeExpired(db: SupabaseClient, retentionDays: number): Promise<number> {
    const { data, error } = await db.rpc("purge_expired_data", { p_retention_days: retentionDays });
    if (error) throw new AppError("internal", error.message);
    return typeof data === "number" ? data : 0;
  },
};
