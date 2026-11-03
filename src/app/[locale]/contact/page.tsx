import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { getCvContent } from "@/server/services/content-service";
import { ContactForm } from "@/components/site/contact-form";
import { CopyButton } from "@/components/site/copy-button";
import { SocialLinks } from "@/components/site/social-links";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  return pageMetadata({
    locale,
    path: "/contact",
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
    siteName: content.profile.fullName,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const C = dict.contact;
  const { content } = await getCvContent();
  const { contact, profile } = content;

  return (
    <div className="container-page pt-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{C.title}</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">{dict.home.ctaTitle}</h1>
        <p className="mt-5 text-lg text-muted">{C.intro}</p>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <aside className="space-y-10">
          <section aria-labelledby="direct-title">
            <h2 id="direct-title" className="text-xs font-semibold uppercase tracking-wider text-muted">
              {C.directTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3">
                <Mail size={18} aria-hidden="true" className="shrink-0 text-accent" />
                <a href={`mailto:${contact.email}`} className="link-underline min-w-0 break-all">
                  {contact.email}
                </a>
                <CopyButton value={contact.email} label={C.copyEmail} copiedLabel={C.copied} />
              </li>
              {contact.showPhone && contact.phone ? (
                <li className="flex items-center gap-3">
                  <Phone size={18} aria-hidden="true" className="shrink-0 text-accent" />
                  <a href={`tel:${contact.phone.replace(/[^+0-9]/g, "")}`} className="link-underline">
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center gap-3">
                <MapPin size={18} aria-hidden="true" className="shrink-0 text-accent" />
                {t(profile.location, locale)}
              </li>
            </ul>
          </section>
          <section aria-labelledby="profiles-title">
            <h2 id="profiles-title" className="text-xs font-semibold uppercase tracking-wider text-muted">
              {C.profilesTitle}
            </h2>
            <div className="mt-3">
              <SocialLinks contact={contact} withLabels />
            </div>
          </section>
        </aside>
        <ContactForm locale={locale} labels={C} />
      </div>
    </div>
  );
}
