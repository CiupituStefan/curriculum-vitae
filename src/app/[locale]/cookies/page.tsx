import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PRIVACY_UPDATED, cookiePolicy } from "@/i18n/privacy";
import { formatMonth } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getCvContent } from "@/server/services/content-service";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  return pageMetadata({ locale, path: "/cookies", title: dict.meta.cookiesTitle, description: dict.meta.cookiesDescription, siteName: content.profile.fullName });
}

const HEADERS: Record<Locale, string[]> = {
  ro: ["Nume", "Tip", "Scop", "Durată", "Când este setat"],
  en: ["Name", "Type", "Purpose", "Duration", "When it is set"],
};

export default async function CookiesPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const policy = cookiePolicy(locale);
  const [name, type, purpose, duration, setWhen] = HEADERS[locale];

  return (
    <article className="container-page max-w-4xl pt-12 md:pt-16">
      <h1 className="display text-4xl sm:text-5xl">{dict.meta.cookiesTitle}</h1>
      <p className="mt-5 text-lg text-muted">{policy.intro}</p>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">{dict.meta.cookiesTitle}</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              {[name, type, purpose, duration, setWhen].map((header) => (
                <th key={header} scope="col" className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {policy.rows.map((row) => (
              <tr key={row.name} className="align-top">
                <th scope="row" className="px-4 py-3 font-mono text-xs font-medium">
                  {row.name}
                </th>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.purpose}</td>
                <td className="px-4 py-3 text-muted">{row.duration}</td>
                <td className="px-4 py-3 text-muted">{row.setWhen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 space-y-10">
        {policy.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink/90">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 border-t border-line pt-6 text-sm text-muted">
        <Link href={`/${locale}/privacy`} className="underline underline-offset-2">
          {dict.meta.privacyTitle}
        </Link>{" "}
        · {locale === "ro" ? "Ultima actualizare" : "Last updated"}: <time dateTime={PRIVACY_UPDATED}>{PRIVACY_UPDATED.slice(8)} {formatMonth(PRIVACY_UPDATED.slice(0, 7), locale)}</time>
      </p>
    </article>
  );
}
