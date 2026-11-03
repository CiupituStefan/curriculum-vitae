import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";
import type { SectionKey } from "@/domain/content/schema";

export type SectionRow = { key: string; data: unknown; updated_at: string };
export type RevisionRow = { id: number; key: string; created_at: string };

/** Data access for `public.cv_sections`. Pure persistence: no validation, no authorization. */
export const contentRepository = {
  async listSections(db: SupabaseClient): Promise<SectionRow[]> {
    const { data, error } = await db.from("cv_sections").select("key, data, updated_at");
    if (error) throw new AppError("unavailable", error.message);
    return data ?? [];
  },

  async upsertSection(db: SupabaseClient, key: SectionKey, value: unknown, userId: string): Promise<void> {
    const { error } = await db
      .from("cv_sections")
      .upsert({ key, data: value, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new AppError(error.code === "42501" ? "forbidden" : "internal", error.message);
  },

  async listRevisions(db: SupabaseClient, key: SectionKey, limit = 20): Promise<RevisionRow[]> {
    const { data, error } = await db
      .from("cv_section_revisions")
      .select("id, key, created_at")
      .eq("key", key)
      .order("id", { ascending: false })
      .limit(limit);
    if (error) throw new AppError("internal", error.message);
    return data ?? [];
  },

  async getRevision(db: SupabaseClient, id: number): Promise<{ key: string; data: unknown } | null> {
    const { data, error } = await db.from("cv_section_revisions").select("key, data").eq("id", id).maybeSingle();
    if (error) throw new AppError("internal", error.message);
    return data;
  },
};
