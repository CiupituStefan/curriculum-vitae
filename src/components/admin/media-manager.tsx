"use client";

import Image from "next/image";
import { FileText, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import type { Project } from "@/domain/projects/schema";
import { mediaUrl } from "@/lib/media";
import { removeProjectFileAction, uploadProjectFileAction, type UploadState } from "@/app/admin/actions";
import { Notice } from "./notice";

const UPLOAD_ERRORS: Record<string, string> = {
  payload_too_large: "Fișierul depășește 4 MB.",
  unsupported_file: "Tip de fișier neacceptat sau fișier cu conținut activ. Imagini: JPEG, PNG, WebP, AVIF. Documente: PDF fără scripturi.",
  validation: "Fișier lipsă sau limită atinsă.",
};

function UploadForm({ projectId, target, label, accept, withAlt }: { projectId: string; target: "cover" | "gallery" | "attachment"; label: string; accept: string; withAlt: boolean }) {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadProjectFileAction, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-dashed border-line-strong p-4">
      <input type="hidden" name="id" value={projectId} />
      <input type="hidden" name="target" value={target} />
      <label className="block text-sm font-medium">
        {label}
        <input name="file" type="file" accept={accept} required className="mt-2 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm" />
      </label>
      {withAlt ? (
        <div className="grid gap-2 md:grid-cols-2">
          <input name="alt.ro" placeholder="Text alternativ (RO)" aria-label="Text alternativ RO" className="field text-sm" maxLength={200} />
          <input name="alt.en" placeholder="Alt text (EN)" aria-label="Text alternativ EN" className="field text-sm" maxLength={200} />
        </div>
      ) : null}
      {state.code ? <Notice tone="danger">{UPLOAD_ERRORS[state.code] ?? `Încărcarea a eșuat (${state.code}).`}</Notice> : null}
      {state.ok ? <Notice tone="success">Fișier încărcat.</Notice> : null}
      <button className="btn btn-secondary min-h-0 h-9 text-sm" disabled={pending}>
        {pending ? <LoaderCircle size={15} aria-hidden="true" className="animate-spin" /> : <Upload size={15} aria-hidden="true" />}
        Încarcă
      </button>
    </form>
  );
}

function RemoveButton({ projectId, path }: { projectId: string; path: string }) {
  return (
    <form
      action={removeProjectFileAction}
      onSubmit={(event) => {
        if (!window.confirm("Ștergi definitiv acest fișier?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={projectId} />
      <input type="hidden" name="path" value={path} />
      <button className="btn btn-ghost size-9 min-h-0 p-0 text-danger" aria-label="Șterge fișierul" title="Șterge fișierul">
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </form>
  );
}

export function MediaManager({ project }: { project: Project }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="cover-title">
        <h3 id="cover-title" className="text-sm font-semibold">Imagine principală</h3>
        {project.cover ? (
          <div className="mt-3 flex items-center gap-4">
            <Image src={mediaUrl(project.cover.path)} alt={project.cover.alt.ro} width={160} height={100} className="h-24 w-40 rounded-xl border border-line object-cover" />
            <RemoveButton projectId={project.id} path={project.cover.path} />
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">Fără imagine — se folosește coperta tipografică.</p>
        )}
        <div className="mt-3">
          <UploadForm projectId={project.id} target="cover" label="Înlocuiește imaginea principală" accept="image/jpeg,image/png,image/webp,image/avif" withAlt />
        </div>
      </section>

      <section aria-labelledby="gallery-title">
        <h3 id="gallery-title" className="text-sm font-semibold">Galerie ({project.gallery.length}/24)</h3>
        {project.gallery.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {project.gallery.map((image) => (
              <li key={image.path} className="relative">
                <Image src={mediaUrl(image.path)} alt={image.alt.ro} width={200} height={140} className="aspect-[4/3] w-full rounded-xl border border-line object-cover" />
                <div className="absolute right-1 top-1 rounded-full bg-surface">
                  <RemoveButton projectId={project.id} path={image.path} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3">
          <UploadForm projectId={project.id} target="gallery" label="Adaugă imagine în galerie" accept="image/jpeg,image/png,image/webp,image/avif" withAlt />
        </div>
      </section>

      <section aria-labelledby="files-title">
        <h3 id="files-title" className="text-sm font-semibold">Documente atașate ({project.attachments.length}/12)</h3>
        {project.attachments.length > 0 ? (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {project.attachments.map((file) => (
              <li key={file.path} className="flex items-center gap-3 px-4 py-2 text-sm">
                <FileText size={16} aria-hidden="true" className="text-accent" />
                <a href={mediaUrl(file.path, file.name)} className="min-w-0 flex-1 truncate hover:underline">
                  {file.name}
                </a>
                <RemoveButton projectId={project.id} path={file.path} />
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3">
          <UploadForm projectId={project.id} target="attachment" label="Adaugă document PDF (max. 4 MB)" accept="application/pdf" withAlt={false} />
        </div>
      </section>
    </div>
  );
}
