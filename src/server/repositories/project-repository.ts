import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";
import type { Project, ProjectInput, ProjectAttachment, ProjectMedia } from "@/domain/projects/schema";

/** Row shape of `public.projects` (snake_case, as stored). */
export type ProjectRow = {
  id: string;
  slug: string;
  status: string;
  featured: boolean;
  sort_order: number;
  category: string;
  year: number;
  title: unknown;
  summary: unknown;
  description: unknown;
  objective: unknown;
  problem: unknown;
  role: unknown;
  contribution: unknown;
  process: unknown;
  results: unknown;
  technologies: string[];
  live_url: string;
  repo_url: string;
  docs_url: string;
  cover: unknown;
  gallery: unknown;
  attachments: unknown;
};

const COLUMNS =
  "id, slug, status, featured, sort_order, category, year, title, summary, description, objective, problem, role, contribution, process, results, technologies, live_url, repo_url, docs_url, cover, gallery, attachments";

export function rowToProject(row: ProjectRow): unknown {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    featured: row.featured,
    sortOrder: row.sort_order,
    category: row.category,
    year: row.year,
    title: row.title,
    summary: row.summary,
    description: row.description,
    objective: row.objective,
    problem: row.problem,
    role: row.role,
    contribution: row.contribution,
    process: row.process,
    results: row.results,
    technologies: row.technologies,
    liveUrl: row.live_url ?? "",
    repoUrl: row.repo_url ?? "",
    docsUrl: row.docs_url ?? "",
    cover: row.cover ?? null,
    gallery: row.gallery ?? [],
    attachments: row.attachments ?? [],
  };
}

export function inputToRow(input: ProjectInput) {
  return {
    slug: input.slug,
    status: input.status,
    featured: input.featured,
    sort_order: input.sortOrder,
    category: input.category,
    year: input.year,
    title: input.title,
    summary: input.summary,
    description: input.description,
    objective: input.objective,
    problem: input.problem,
    role: input.role,
    contribution: input.contribution,
    process: input.process,
    results: input.results,
    technologies: input.technologies,
    live_url: input.liveUrl,
    repo_url: input.repoUrl,
    docs_url: input.docsUrl,
  };
}

function fail(error: { code?: string; message: string }): never {
  if (error.code === "23505") throw new AppError("conflict", error.message);
  if (error.code === "42501") throw new AppError("forbidden", error.message);
  throw new AppError("internal", error.message);
}

/** Data access for `public.projects`. Visibility of drafts is enforced by RLS, not here. */
export const projectRepository = {
  async list(db: SupabaseClient): Promise<ProjectRow[]> {
    const { data, error } = await db
      .from("projects")
      .select(COLUMNS)
      .order("sort_order", { ascending: true })
      .order("year", { ascending: false });
    if (error) throw new AppError("unavailable", error.message);
    return (data ?? []) as ProjectRow[];
  },

  async findById(db: SupabaseClient, id: string): Promise<ProjectRow | null> {
    const { data, error } = await db.from("projects").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) fail(error);
    return data as ProjectRow | null;
  },

  async create(db: SupabaseClient, input: ProjectInput, userId: string): Promise<string> {
    const { data, error } = await db
      .from("projects")
      .insert({ ...inputToRow(input), updated_by: userId })
      .select("id")
      .single();
    if (error) fail(error);
    return (data as { id: string }).id;
  },

  async update(db: SupabaseClient, id: string, input: ProjectInput, userId: string): Promise<void> {
    const { error, count } = await db
      .from("projects")
      .update({ ...inputToRow(input), updated_by: userId, updated_at: new Date().toISOString() }, { count: "exact" })
      .eq("id", id);
    if (error) fail(error);
    if (count === 0) throw new AppError("not_found");
  },

  async updateMedia(
    db: SupabaseClient,
    id: string,
    media: { cover: ProjectMedia | null; gallery: ProjectMedia[]; attachments: ProjectAttachment[] },
    userId: string,
  ): Promise<void> {
    const { error, count } = await db
      .from("projects")
      .update({ ...media, updated_by: userId, updated_at: new Date().toISOString() }, { count: "exact" })
      .eq("id", id);
    if (error) fail(error);
    if (count === 0) throw new AppError("not_found");
  },

  async remove(db: SupabaseClient, id: string): Promise<void> {
    const { error, count } = await db.from("projects").delete({ count: "exact" }).eq("id", id);
    if (error) fail(error);
    if (count === 0) throw new AppError("not_found");
  },
};

export type { Project };
