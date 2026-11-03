import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { History } from "lucide-react";
import { isSectionKey } from "@/domain/content/schema";
import { requireAdmin } from "@/server/auth";
import { getCvContent, listSectionRevisions } from "@/server/services/content-service";
import { SectionEditor } from "@/components/admin/section-editor";
import { SECTION_FORMS } from "@/components/admin/section-forms";
import { Notice } from "@/components/admin/notice";
import { restoreRevisionAction } from "../../../actions";

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ restored?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  return { title: isSectionKey(section) ? SECTION_FORMS[section].title : "Conținut" };
}

export default async function SectionPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { section } = await params;
  if (!isSectionKey(section)) notFound();
  const { restored } = await searchParams;
  const [{ content }, revisions] = await Promise.all([getCvContent(), listSectionRevisions(section)]);
  const form = SECTION_FORMS[section];

  return (
    <div className="max-w-5xl">
      <p className="eyebrow">Conținut CV</p>
      <h1 className="display mt-2 text-4xl">{form.title}</h1>
      <p className="mt-2 text-muted">{form.description} Completează ambele limbi (RO și EN).</p>
      {restored ? (
        <Notice tone="success" className="mt-6">
          Versiunea anterioară a fost restaurată.
        </Notice>
      ) : null}

      <div className="mt-8">
        <SectionEditor key={revisions[0]?.id ?? "initial"} section={section} initial={content[section]} writable />
      </div>

      <section className="mt-12" aria-labelledby="history-title">
        <h2 id="history-title" className="flex items-center gap-2 text-lg font-semibold">
          <History size={18} aria-hidden="true" /> Istoric versiuni
        </h2>
        {revisions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nicio versiune salvată încă.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {revisions.map((revision, index) => (
              <li key={revision.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span>
                  <time dateTime={revision.created_at}>{new Date(revision.created_at).toLocaleString("ro-RO")}</time>
                  {index === 0 ? <span className="ml-2 text-xs text-muted">(curentă)</span> : null}
                </span>
                {index > 0 ? (
                  <form action={restoreRevisionAction}>
                    <input type="hidden" name="revisionId" value={revision.id} />
                    <button className="btn btn-secondary min-h-0 h-8 text-xs">Restaurează</button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
