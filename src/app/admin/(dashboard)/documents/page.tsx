import type { Metadata } from "next";
import { Download, Eye } from "lucide-react";
import { LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { CV_FORMATS } from "@/pdf/formats";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "CV-uri PDF" };

export default async function DocumentsPage() {
  await requireAdmin();
  const labels = getDictionary("ro").download.formats;
  return (
    <div className="max-w-4xl">
      <h1 className="display text-4xl">CV-uri PDF</h1>
      <p className="mt-2 text-muted">
        PDF-urile sunt generate pe server la fiecare descărcare, direct din conținutul curent. Orice modificare salvată în secțiunile CV-ului
        apare imediat în toate cele 8 variante — nu este nevoie de o regenerare manuală. Folosește linkurile de mai jos pentru a verifica rezultatul.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Format</th>
              {LOCALES.map((locale) => (
                <th key={locale} scope="col" className="px-5 py-3 font-semibold">
                  {locale.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {CV_FORMATS.map((format) => (
              <tr key={format}>
                <th scope="row" className="px-5 py-3 font-medium">
                  {labels[format].label}
                  <span className="block text-xs font-normal text-muted">{labels[format].description}</span>
                </th>
                {LOCALES.map((locale) => (
                  <td key={locale} className="px-5 py-3">
                    <div className="flex gap-2">
                      <a href={`/api/cv/${locale}/${format}?inline=1`} target="_blank" rel="noopener" className="btn btn-secondary min-h-0 h-8 px-3 text-xs">
                        <Eye size={14} aria-hidden="true" /> Previzualizare
                      </a>
                      <a href={`/api/cv/${locale}/${format}`} download className="btn btn-ghost min-h-0 h-8 px-3 text-xs" aria-label={`Descarcă ${labels[format].label} ${locale.toUpperCase()}`}>
                        <Download size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
