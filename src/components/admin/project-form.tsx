"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import { projectCategories, type Project } from "@/domain/projects/schema";
import { saveProjectAction, type ProjectFormState } from "@/app/admin/actions";
import { Notice } from "./notice";

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "PCB & hardware",
  rf: "RF & antene",
  embedded: "Embedded & IoT",
  web: "Web",
  security: "Securitate",
  networking: "Rețelistică",
};

const LOCALIZED_FIELDS: { name: keyof Project; label: string; rows: number; required?: boolean }[] = [
  { name: "title", label: "Titlu", rows: 1, required: true },
  { name: "summary", label: "Rezumat (card)", rows: 3, required: true },
  { name: "description", label: "Descriere / prezentare", rows: 5 },
  { name: "objective", label: "Obiectiv", rows: 3 },
  { name: "problem", label: "Problema rezolvată", rows: 3 },
  { name: "role", label: "Rolul meu", rows: 1 },
  { name: "contribution", label: "Contribuția personală", rows: 4 },
  { name: "process", label: "Procesul de implementare", rows: 5 },
  { name: "results", label: "Rezultate", rows: 4 },
];

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(saveProjectAction, { ok: false });
  const errors = state.fieldErrors ?? {};
  const err = (name: string) =>
    Object.entries(errors)
      .filter(([path]) => path === name || path.startsWith(`${name}.`))
      .map(([, message]) => message)[0];

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={project?.id ?? ""} />
      {state.ok && state.savedAt ? <Notice tone="success">Proiectul a fost salvat.</Notice> : null}
      {!state.ok && state.code ? (
        <Notice tone="danger">
          {state.code === "conflict" ? "Există deja un proiect cu acest slug." : state.code === "validation" ? "Verifică câmpurile marcate." : `Salvarea a eșuat (${state.code}).`}
        </Notice>
      ) : null}

      <fieldset className="grid gap-4 rounded-2xl border border-line bg-surface p-5 md:grid-cols-3">
        <legend className="px-1 text-sm font-semibold">Setări</legend>
        <div>
          <label htmlFor="slug" className="text-sm font-medium">Slug (URL) *</label>
          <input id="slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={project?.slug} className="field mt-1 text-sm" aria-invalid={Boolean(err("slug"))} />
          {err("slug") ? <p className="mt-1 text-xs text-danger">litere mici, cifre, cratimă</p> : null}
        </div>
        <div>
          <label htmlFor="category" className="text-sm font-medium">Categorie</label>
          <select id="category" name="category" defaultValue={project?.category ?? "hardware"} className="field mt-1 text-sm">
            {projectCategories.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="text-sm font-medium">An *</label>
          <input id="year" name="year" type="number" min={1990} max={2100} required defaultValue={project?.year ?? new Date().getFullYear()} className="field mt-1 text-sm" aria-invalid={Boolean(err("year"))} />
        </div>
        <div>
          <label htmlFor="status" className="text-sm font-medium">Stare</label>
          <select id="status" name="status" defaultValue={project?.status ?? "draft"} className="field mt-1 text-sm">
            <option value="draft">Ciornă (nepublicat)</option>
            <option value="published">Publicat</option>
          </select>
        </div>
        <div>
          <label htmlFor="sortOrder" className="text-sm font-medium">Ordine afișare</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} max={10000} defaultValue={project?.sortOrder ?? 100} className="field mt-1 text-sm" />
        </div>
        <label className="flex items-center gap-3 self-end py-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={project?.featured} className="size-4 accent-[var(--accent)]" />
          Recomandat pe pagina principală
        </label>
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-line bg-surface p-5">
        <legend className="px-1 text-sm font-semibold">Studiu de caz (RO / EN)</legend>
        {LOCALIZED_FIELDS.map((field) => {
          const value = project?.[field.name] as { ro: string; en: string } | undefined;
          return (
            <div key={field.name}>
              <p className="text-sm font-medium">
                {field.label}
                {field.required ? <span className="text-danger"> *</span> : null}
                {err(field.name) ? <span className="ml-2 text-xs font-normal text-danger">obligatoriu în ambele limbi / prea lung</span> : null}
              </p>
              <div className="mt-1 grid gap-2 md:grid-cols-2">
                {(["ro", "en"] as const).map((lang) =>
                  field.rows === 1 ? (
                    <input key={lang} name={`${field.name}.${lang}`} lang={lang} aria-label={`${field.label} ${lang.toUpperCase()}`} placeholder={lang.toUpperCase()} defaultValue={value?.[lang]} required={field.required} className="field text-sm" />
                  ) : (
                    <textarea key={lang} name={`${field.name}.${lang}`} lang={lang} rows={field.rows} aria-label={`${field.label} ${lang.toUpperCase()}`} placeholder={lang.toUpperCase()} defaultValue={value?.[lang]} required={field.required} className="field text-sm" />
                  ),
                )}
              </div>
            </div>
          );
        })}
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-line bg-surface p-5 md:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Tehnologii și linkuri</legend>
        <div className="md:col-span-2">
          <label htmlFor="technologies" className="text-sm font-medium">Tehnologii <span className="font-normal text-muted">separate prin virgulă</span></label>
          <input id="technologies" name="technologies" defaultValue={project?.technologies.join(", ")} className="field mt-1 text-sm" />
        </div>
        {(
          [
            ["liveUrl", "Link proiect live"],
            ["repoUrl", "Link GitHub"],
            ["docsUrl", "Link documentație"],
          ] as const
        ).map(([name, label]) => (
          <div key={name}>
            <label htmlFor={name} className="text-sm font-medium">{label}</label>
            <input id={name} name={name} type="url" placeholder="https://" defaultValue={project?.[name]} className="field mt-1 text-sm" aria-invalid={Boolean(err(name))} />
            {err(name) ? <p className="mt-1 text-xs text-danger">Doar linkuri http(s) valide.</p> : null}
          </div>
        ))}
      </fieldset>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Save size={16} aria-hidden="true" />}
        {project ? "Salvează proiectul" : "Creează proiectul"}
      </button>
    </form>
  );
}
