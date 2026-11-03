import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { ProjectForm } from "@/components/admin/project-form";

export const metadata: Metadata = { title: "Proiect nou" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="max-w-5xl">
      <h1 className="display text-4xl">Proiect nou</h1>
      <p className="mt-2 text-muted">După creare poți încărca imagini, galerie și documente.</p>
      <div className="mt-8">
        <ProjectForm />
      </div>
    </div>
  );
}
