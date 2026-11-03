import "server-only";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { sanitizeFileName } from "@/lib/security/file-validation";
import type { Localized } from "@/i18n/config";
import { projectRepository } from "@/server/repositories/project-repository";
import { sessionClient } from "@/server/supabase/clients";
import { requireAdmin } from "@/server/auth";
import { adminGetProject } from "./project-service";
import { storageService } from "./storage-service";

const MAX_GALLERY = 24;
const MAX_ATTACHMENTS = 12;

async function save(projectId: string, userId: string, project: Awaited<ReturnType<typeof adminGetProject>>) {
  await projectRepository.updateMedia(
    await sessionClient(),
    projectId,
    { cover: project.cover, gallery: project.gallery, attachments: project.attachments },
    userId,
  );
}

export async function addProjectImage(projectId: string, file: File, target: "cover" | "gallery", alt: Localized) {
  const { user } = await requireAdmin();
  const project = await adminGetProject(projectId);
  if (target === "gallery" && project.gallery.length >= MAX_GALLERY) throw new AppError("validation", "gallery_full");
  const stored = await storageService.storeImage(project.id, file);
  const media = { ...stored, alt: { ro: alt.ro.slice(0, 200), en: alt.en.slice(0, 200) } };
  const previousCover = project.cover;
  if (target === "cover") project.cover = media;
  else project.gallery.push(media);
  await save(projectId, user.id, project);
  if (target === "cover" && previousCover) await storageService.remove([previousCover.path]);
  logger.info("projects.media_added", { id: projectId, target });
}

export async function addProjectAttachment(projectId: string, file: File) {
  const { user } = await requireAdmin();
  const project = await adminGetProject(projectId);
  if (project.attachments.length >= MAX_ATTACHMENTS) throw new AppError("validation", "attachments_full");
  const stored = await storageService.storeDocument(project.id, file);
  project.attachments.push({ ...stored, name: sanitizeFileName(file.name) });
  await save(projectId, user.id, project);
  logger.info("projects.attachment_added", { id: projectId });
}

/** Removes one media item. The path must belong to this project's record (prevents IDOR on storage). */
export async function removeProjectFile(projectId: string, path: string) {
  const { user } = await requireAdmin();
  const project = await adminGetProject(projectId);
  const owned =
    project.cover?.path === path ||
    project.gallery.some((item) => item.path === path) ||
    project.attachments.some((item) => item.path === path);
  if (!owned) throw new AppError("not_found");
  if (project.cover?.path === path) project.cover = null;
  project.gallery = project.gallery.filter((item) => item.path !== path);
  project.attachments = project.attachments.filter((item) => item.path !== path);
  await save(projectId, user.id, project);
  await storageService.remove([path]);
  logger.info("projects.media_removed", { id: projectId });
}
