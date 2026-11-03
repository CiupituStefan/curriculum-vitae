import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PRIVACY_UPDATED, privacyPolicy } from "@/i18n/privacy";
import { formatMonth } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getCvContent } from "@/server/services/content-service";
import { serverEnv } from "@/server/env.server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  return pageMetadata({ locale, path: "/privacy", title: dict.meta.privacyTitle, description: dict.meta.privacyDescription, siteName: content.profile.fullName });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  const policy = privacyPolicy(locale, content.contact.email, serverEnv.CONTACT_RETENTION_DAYS);

  return (
    <article className="container-page max-w-3xl pt-12 md:pt-16">
      <h1 className="display text-4xl sm:text-5xl">{dict.meta.privacyTitle}</h1>
      <p className="mt-5 text-lg text-muted">{policy.intro}</p>
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
        <a href={`/${locale}/cookies`} className="underline underline-offset-2">
          {dict.meta.cookiesTitle}
        </a>{" "}
        · {locale === "ro" ? "Ultima actualizare" : "Last updated"}: <time dateTime={PRIVACY_UPDATED}>{PRIVACY_UPDATED.slice(8)} {formatMonth(PRIVACY_UPDATED.slice(0, 7), locale)}</time>
      </p>
    </article>
  );
}
