import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { adminListProjects } from "@/server/services/project-service";
import { Notice } from "@/components/admin/notice";

export const metadata: Metadata = { title: "Proiecte" };

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireAdmin();
  const projects = await adminListProjects();
  const { deleted } = await searchParams;
  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Proiecte</h1>
          <p className="mt-2 text-muted">Portofoliul public afișează doar proiectele cu starea „publicat”.</p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-primary">
          <Plus size={16} aria-hidden="true" /> Proiect nou
        </Link>
      </div>
      {deleted ? (
        <Notice tone="success" className="mt-6">
          Proiectul și fișierele lui au fost șterse.
        </Notice>
      ) : null}
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Titlu</th>
              <th scope="col" className="px-5 py-3 font-semibold">Categorie</th>
              <th scope="col" className="px-5 py-3 font-semibold">An</th>
              <th scope="col" className="px-5 py-3 font-semibold">Stare</th>
              <th scope="col" className="px-5 py-3 font-semibold">Ordine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-surface-2">
                <td className="px-5 py-3">
                  <Link href={`/admin/projects/${project.id}`} className="font-medium hover:text-accent">
                    {project.title.ro}
                  </Link>
                  {project.featured ? <span className="ml-2 text-xs text-accent">★ recomandat</span> : null}
                </td>
                <td className="px-5 py-3 text-muted">{project.category}</td>
                <td className="px-5 py-3 tabular-nums text-muted">{project.year}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${project.status === "published" ? "bg-success/10 text-success" : "bg-surface-2 text-muted"}`}>
                    {project.status === "published" ? "publicat" : "ciornă"}
                  </span>
                </td>
                <td className="px-5 py-3 tabular-nums text-muted">{project.sortOrder}</td>
              </tr>
            ))}
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  Niciun proiect încă. <Link href="/admin/projects/new" className="underline">Adaugă primul proiect</Link>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
