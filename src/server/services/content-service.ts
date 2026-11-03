import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { seedContent } from "@/domain/content/seed";
import { SECTION_KEYS, isSectionKey, parseSection, type CvContent, type SectionKey } from "@/domain/content/schema";
import { contentRepository } from "@/server/repositories/content-repository";
import { publicClient, sessionClient } from "@/server/supabase/clients";
import { requireAdmin } from "@/server/auth";

export type ContentSource = "database" | "seed";

/**
 * Loads the CV. Each stored section is re-validated on read; a missing or invalid section falls
 * back to the seed so a bad row can never break the public site or the PDF generator.
 * Deduplicated per request with React `cache`.
 */
export const getCvContent = cache(async (): Promise<{ content: CvContent; source: ContentSource }> => {
  if (!isSupabaseConfigured()) return { content: seedContent, source: "seed" };
  try {
    const rows = await contentRepository.listSections(publicClient());
    const content: Record<string, unknown> = { ...seedContent };
    for (const row of rows) {
      if (!isSectionKey(row.key)) continue;
      const parsed = parseSection(row.key, row.data);
      if (parsed.success) content[row.key] = parsed.data;
      else logger.warn("content.section_invalid", { section: row.key });
    }
    return { content: content as CvContent, source: rows.length > 0 ? "database" : "seed" };
  } catch (error) {
    logger.error("content.load_failed", { error });
    return { content: seedContent, source: "seed" };
  }
});

/** Validates and saves one CV section. Admin only (checked here and again by RLS). */
export async function saveSection(key: SectionKey, value: unknown): Promise<void> {
  const { user } = await requireAdmin();
  if (!SECTION_KEYS.includes(key)) throw new AppError("validation");
  const parsed = parseSection(key, value);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.slice(0, 20).map((issue) => [issue.path.join("."), issue.message]),
    );
    throw new AppError("validation", "Invalid section", fieldErrors);
  }
  await contentRepository.upsertSection(await sessionClient(), key, parsed.data, user.id);
  logger.info("content.section_saved", { section: key });
}

export async function listSectionRevisions(key: SectionKey) {
  await requireAdmin();
  return contentRepository.listRevisions(await sessionClient(), key);
}

/** Restores a previous revision of a section (the restore itself becomes a new revision). */
export async function restoreRevision(revisionId: number): Promise<SectionKey> {
  await requireAdmin();
  const revision = await contentRepository.getRevision(await sessionClient(), revisionId);
  if (!revision || !isSectionKey(revision.key)) throw new AppError("not_found");
  await saveSection(revision.key, revision.data);
  return revision.key;
}
