import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { projectInputSchema, projectSchema, type Project } from "@/domain/projects/schema";
import { seedProjects } from "@/domain/projects/seed";
import { projectRepository, rowToProject, type ProjectRow } from "@/server/repositories/project-repository";
import { publicClient, sessionClient } from "@/server/supabase/clients";
import { requireAdmin } from "@/server/auth";
import { storageService } from "./storage-service";

function toProjects(rows: ProjectRow[]): Project[] {
  const projects: Project[] = [];
  for (const row of rows) {
    const parsed = projectSchema.safeParse(rowToProject(row));
    if (parsed.success) projects.push(parsed.data);
    else logger.warn("projects.row_invalid", { id: row.id });
  }
  return projects;
}

/** Published projects only (RLS for `anon` returns nothing else; we also filter defensively). */
export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  if (!isSupabaseConfigured()) return seedProjects;
  try {
    const rows = await projectRepository.list(publicClient());
    return toProjects(rows).filter((project) => project.status === "published");
  } catch (error) {
    logger.error("projects.load_failed", { error });
    return seedProjects;
  }
});

export async function getPublishedProject(slug: string): Promise<Project | null> {
  const projects = await getPublishedProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

/* ---------- Admin operations (each one re-checks authorization on the server) ---------- */

export async function adminListProjects(): Promise<Project[]> {
  await requireAdmin();
  return toProjects(await projectRepository.list(await sessionClient()));
}

export async function adminGetProject(id: string): Promise<Project> {
  await requireAdmin();
  const row = await projectRepository.findById(await sessionClient(), id);
  if (!row) throw new AppError("not_found");
  const parsed = projectSchema.safeParse(rowToProject(row));
  if (!parsed.success) throw new AppError("internal", "Stored project is invalid");
  return parsed.data;
}

function validateInput(value: unknown) {
  const parsed = projectInputSchema.safeParse(value);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]));
    throw new AppError("validation", "Invalid project", fieldErrors);
  }
  return parsed.data;
}

export async function createProject(value: unknown): Promise<string> {
  const { user } = await requireAdmin();
  const id = await projectRepository.create(await sessionClient(), validateInput(value), user.id);
  logger.info("projects.created", { id });
  return id;
}

export async function updateProject(id: string, value: unknown): Promise<void> {
  const { user } = await requireAdmin();
  await projectRepository.update(await sessionClient(), id, validateInput(value), user.id);
  logger.info("projects.updated", { id });
}

export async function deleteProject(id: string): Promise<void> {
  await requireAdmin();
  const project = await adminGetProject(id);
  await projectRepository.remove(await sessionClient(), id);
  const paths = [project.cover, ...project.gallery, ...project.attachments]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => item.path);
  await storageService.remove(paths);
  logger.info("projects.deleted", { id, files: paths.length });
}
