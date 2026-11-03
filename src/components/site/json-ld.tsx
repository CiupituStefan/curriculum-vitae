import type { Locale } from "@/i18n/config";
import { t } from "@/i18n/config";
import type { CvContent } from "@/domain/content/schema";

/** schema.org structured data. `<` is escaped so content can never break out of the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  // eslint-disable-next-line react/no-danger -- serialised JSON with "<" escaped (see Next.js JSON-LD guide).
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function personJsonLd(content: CvContent, locale: Locale, siteUrl: string): Record<string, unknown> {
  const { profile, contact } = content;
  const sameAs = [contact.linkedin, contact.github, contact.youtube, ...contact.otherLinks.map((l) => l.url)].filter(Boolean);
  const current = content.education.find((item) => item.ongoing);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    url: `${siteUrl}/${locale}`,
    image: `${siteUrl}/images/stefan-ciupitu-square.jpg`,
    jobTitle: t(profile.headline, locale),
    description: t(profile.summary, locale),
    email: `mailto:${contact.email}`,
    address: { "@type": "PostalAddress", addressLocality: t(profile.location, locale).split(",")[0] },
    sameAs,
    knowsLanguage: content.languages.map((language) => language.id),
    knowsAbout: profile.focusAreas.map((area) => t(area, locale)),
    ...(current ? { alumniOf: { "@type": "CollegeOrUniversity", name: t(current.institution, locale) } } : {}),
  };
}
