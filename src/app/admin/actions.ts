"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppError, toErrorCode, type ActionResult } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { isSectionKey } from "@/domain/content/schema";
import { projectCategories, projectStatus } from "@/domain/projects/schema";
import { restoreRevision, saveSection } from "@/server/services/content-service";
import { createProject, deleteProject, updateProject } from "@/server/services/project-service";
import { addProjectAttachment, addProjectImage, removeProjectFile } from "@/server/services/project-media-service";
import { deleteMessage, deleteMessagesByEmail } from "@/server/services/contact-service";
import { confirmEnrollment, removeFactor, startEnrollment } from "@/server/services/mfa-service";
import { sessionClient } from "@/server/supabase/clients";
import { recordSecurityEvent } from "@/server/services/security-events";

/*
 * Admin Server Actions. Each one delegates to a service that calls requireAdmin() first, so
 * authorization is enforced on the server for every operation (and again by Postgres RLS).
 * Next.js rejects Server Action requests whose Origin does not match the host (CSRF).
 */

function failure(error: unknown): ActionResult<never> {
  const code = toErrorCode(error);
  if (code === "internal") logger.error("admin.action_failed", { error });
  return { ok: false, code, fieldErrors: error instanceof AppError ? error.fieldErrors : undefined };
}

function refreshPublicSite() {
  revalidatePath("/", "layout");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function assertUuid(id: unknown): string {
  if (typeof id !== "string" || !UUID.test(id)) throw new AppError("validation", "invalid id");
  return id;
}

export async function saveSectionAction(section: string, json: string): Promise<ActionResult> {
  try {
    if (!isSectionKey(section)) throw new AppError("validation");
    if (json.length > 500_000) throw new AppError("payload_too_large");
    let value: unknown;
    try {
      value = JSON.parse(json);
    } catch {
      throw new AppError("validation");
    }
    await saveSection(section, value);
    refreshPublicSite();
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function restoreRevisionAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("revisionId"));
  if (!Number.isInteger(id) || id <= 0) throw new AppError("validation");
  const section = await restoreRevision(id);
  refreshPublicSite();
  redirect(`/admin/content/${section}?restored=1`);
}

/* ------------------------------- Projects ------------------------------- */

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
const localized = (formData: FormData, name: string) => ({ ro: text(formData, `${name}.ro`), en: text(formData, `${name}.en`) });

function projectFromForm(formData: FormData) {
  const status = text(formData, "status");
  const category = text(formData, "category");
  return {
    slug: text(formData, "slug").trim().toLowerCase(),
    status: (projectStatus as readonly string[]).includes(status) ? status : "draft",
    featured: formData.get("featured") === "on",
    sortOrder: Number(text(formData, "sortOrder") || 0),
    category: (projectCategories as readonly string[]).includes(category) ? category : "",
    year: Number(text(formData, "year")),
    title: localized(formData, "title"),
    summary: localized(formData, "summary"),
    description: localized(formData, "description"),
    objective: localized(formData, "objective"),
    problem: localized(formData, "problem"),
    role: localized(formData, "role"),
    contribution: localized(formData, "contribution"),
    process: localized(formData, "process"),
    results: localized(formData, "results"),
    technologies: text(formData, "technologies").split(",").map((tech) => tech.trim()).filter(Boolean),
    liveUrl: text(formData, "liveUrl").trim(),
    repoUrl: text(formData, "repoUrl").trim(),
    docsUrl: text(formData, "docsUrl").trim(),
  };
}

export type ProjectFormState = { ok: boolean; code?: string; fieldErrors?: Record<string, string>; savedAt?: number };

export async function saveProjectAction(_previous: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const rawId = text(formData, "id");
  let createdId: string | undefined;
  try {
    const input = projectFromForm(formData);
    if (rawId) await updateProject(assertUuid(rawId), input);
    else createdId = await createProject(input);
    refreshPublicSite();
  } catch (error) {
    const result = failure(error);
    return { ok: false, code: result.ok ? undefined : result.code, fieldErrors: result.ok ? undefined : result.fieldErrors };
  }
  if (createdId) redirect(`/admin/projects/${createdId}?created=1`);
  return { ok: true, savedAt: Date.now() };
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await deleteProject(assertUuid(formData.get("id")));
  refreshPublicSite();
  redirect("/admin/projects?deleted=1");
}

export type UploadState = { ok: boolean; code?: string; at?: number };

export async function uploadProjectFileAction(_previous: UploadState, formData: FormData): Promise<UploadState> {
  try {
    const id = assertUuid(formData.get("id"));
    const target = text(formData, "target");
    const file = formData.get("file");
    if (!(file instanceof File)) throw new AppError("validation");
    if (target === "cover" || target === "gallery") await addProjectImage(id, file, target, localized(formData, "alt"));
    else if (target === "attachment") await addProjectAttachment(id, file);
    else throw new AppError("validation");
    refreshPublicSite();
    revalidatePath(`/admin/projects/${id}`);
    return { ok: true, at: Date.now() };
  } catch (error) {
    const result = failure(error);
    return { ok: false, code: result.ok ? undefined : result.code, at: Date.now() };
  }
}

export async function removeProjectFileAction(formData: FormData): Promise<void> {
  const id = assertUuid(formData.get("id"));
  const path = text(formData, "path");
  await removeProjectFile(id, path);
  refreshPublicSite();
  revalidatePath(`/admin/projects/${id}`);
}

/* ------------------------------- Messages ------------------------------- */

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await deleteMessage(text(formData, "id"));
  revalidatePath("/admin/messages");
}

/** Erasure request: deletes every contact message from one e-mail address. */
export async function deleteMessagesByEmailAction(formData: FormData): Promise<void> {
  const email = text(formData, "email");
  const deleted = await deleteMessagesByEmail(email);
  revalidatePath("/admin/messages");
  redirect(`/admin/messages?erased=${deleted}`);
}

/* -------------------------------- Session ------------------------------- */

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await sessionClient();
    const { data } = await supabase.auth.getUser();
    await supabase.auth.signOut();
    await recordSecurityEvent("auth.signed_out", {}, { actor: data.user?.id });
  } catch (error) {
    logger.warn("auth.signout_failed", { error });
  }
  redirect("/admin/login");
}

/* ---------------------------------- MFA --------------------------------- */

export type EnrollState =
  | { step: "idle"; error?: string }
  | { step: "scan"; factorId: string; qrCode: string; secret: string; error?: string }
  | { step: "done" };

export async function startMfaEnrollmentAction(): Promise<EnrollState> {
  try {
    return { step: "scan", ...(await startEnrollment()) };
  } catch (error) {
    return { step: "idle", error: toErrorCode(error) };
  }
}

export async function confirmMfaEnrollmentAction(factorId: string, code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await confirmEnrollment(factorId, code.replace(/\s+/g, ""));
    revalidatePath("/admin/security");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorCode(error) };
  }
}

export async function removeMfaFactorAction(formData: FormData): Promise<void> {
  await removeFactor(text(formData, "factorId"));
  revalidatePath("/admin/security");
}
