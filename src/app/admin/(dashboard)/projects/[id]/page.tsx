import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { AppError } from "@/lib/errors";
import { requireAdmin } from "@/server/auth";
import { adminGetProject } from "@/server/services/project-service";
import { ProjectForm } from "@/components/admin/project-form";
import { MediaManager } from "@/components/admin/media-manager";
import { Notice } from "@/components/admin/notice";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { deleteProjectAction } from "../../../actions";

export const metadata: Metadata = { title: "Editează proiectul" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const project = await adminGetProject(id).catch((error: unknown) => {
    if (error instanceof AppError && error.code === "not_found") notFound();
    throw error;
  });
  const { created } = await searchParams;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/projects" className="btn btn-ghost -ml-3 text-sm">
        <ArrowLeft size={16} aria-hidden="true" /> Toate proiectele
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">{project.title.ro}</h1>
        {project.status === "published" ? (
          <a href={`/ro/portfolio/${project.slug}`} target="_blank" rel="noopener" className="btn btn-secondary text-sm">
            <ExternalLink size={15} aria-hidden="true" /> Vezi pe site
          </a>
        ) : null}
      </div>
      {created ? (
        <Notice tone="success" className="mt-6">
          Proiect creat. Acum poți adăuga imagini și documente.
        </Notice>
      ) : null}

      <div className="mt-8 grid gap-10 xl:grid-cols-[1fr_22rem]">
        <ProjectForm project={project} />
        <aside className="space-y-8">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">Imagini și fișiere</h2>
            <p className="mt-1 text-xs text-muted">Imaginile sunt re-codate în WebP, fără metadate EXIF/GPS. PDF-urile cu scripturi sau acțiuni automate sunt respinse.</p>
            <div className="mt-5">
              <MediaManager project={project} />
            </div>
          </div>
          <form action={deleteProjectAction} className="rounded-2xl border border-danger/30 p-5">
            <input type="hidden" name="id" value={project.id} />
            <h2 className="text-sm font-semibold text-danger">Zonă periculoasă</h2>
            <p className="mt-1 text-xs text-muted">Șterge proiectul și toate fișierele lui. Acțiunea nu poate fi anulată.</p>
            <ConfirmSubmit message={`Ștergi definitiv proiectul „${project.title.ro}”?`} className="btn mt-3 border border-danger/40 text-sm text-danger hover:bg-danger/5">
              <Trash2 size={15} aria-hidden="true" /> Șterge proiectul „{project.title.ro}”
            </ConfirmSubmit>
          </form>
        </aside>
      </div>
    </div>
  );
}
