import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { siteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";
import { recencyKey } from "@/lib/format";
import { getCvContent } from "@/server/services/content-service";
import { getPublishedProjects } from "@/server/services/project-service";
import { DownloadCvDialog } from "@/components/site/download-dialog";
import { SocialLinks } from "@/components/site/social-links";
import { SectionHeading } from "@/components/ui/section-heading";
import { ExperienceTimeline } from "@/components/cv/experience-timeline";
import { ProjectCard } from "@/components/portfolio/project-card";
import { JsonLd, personJsonLd } from "@/components/site/json-ld";
import portrait from "@/assets/stefan-ciupitu-portrait.jpg";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getCvContent();
  return pageMetadata({
    locale,
    path: "/",
    title: t(content.seo.title, locale),
    description: t(content.seo.description, locale),
    siteName: content.profile.fullName,
    type: "profile",
  });
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const [{ content }, projects] = await Promise.all([getCvContent(), getPublishedProjects()]);
  const { profile, contact } = content;

  const recent = [...content.experience]
    .sort((a, b) => recencyKey(b.start, b.end).localeCompare(recencyKey(a.start, a.end)))
    .slice(0, 4);
  const featured = projects.filter((project) => project.featured).slice(0, 3);

  // Every number below is computed from the stored content — none is hard-coded.
  const stats = [
    { value: content.experience.length, label: dict.home.stats.experience },
    { value: projects.length, label: dict.home.stats.projects },
    { value: content.certifications.length, label: dict.home.stats.certifications },
    { value: content.languages.length, label: dict.home.stats.languages },
  ].filter((stat) => stat.value > 0);

  const [firstName, ...rest] = profile.fullName.split(" ");

  return (
    <>
      <JsonLd data={personJsonLd(content, locale, siteUrl)} />

      {/* Hero — no scroll-reveal above the fold: it would delay LCP until hydration. */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--accent-soft),transparent_70%)]"
        />
        <div className="container-page grid items-center gap-12 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24">
          <div>
            <p className="eyebrow">
              {t(profile.headline, locale)}
            </p>
            <h1 id="hero-title" className="display mt-5 text-[clamp(2.75rem,7vw,5.25rem)]">
              {firstName}
              <br />
              <span className="italic text-accent">{rest.join(" ")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t(profile.summary, locale)}
            </p>

            <ul className="mt-6 flex max-w-xl flex-wrap gap-2" aria-label={dict.home.focusTitle}>
              {profile.focusAreas.slice(0, 6).map((area) => (
                <li key={area.en} className="chip">
                  {t(area, locale)}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <DownloadCvDialog
                locale={locale}
                labels={dict.download}
                trigger={{
                  className: "btn btn-primary",
                  children: (
                    <>
                      <Download size={18} aria-hidden="true" />
                      {dict.hero.downloadCv}
                    </>
                  ),
                }}
              />
              <Link href={`/${locale}/portfolio`} className="btn btn-secondary">
                {dict.hero.explorePortfolio}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href={`/${locale}/contact`} className="btn btn-ghost">
                {dict.hero.contactMe}
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <SocialLinks contact={{ ...contact, otherLinks: [] }} />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div aria-hidden="true" className="absolute -right-3 -top-3 hidden h-full w-full rounded-[2rem] border border-accent/40 sm:block" />
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface-2 shadow-card">
              <Image
                src={portrait}
                alt={t(profile.photoAlt, locale)}
                sizes="(min-width: 1024px) 30rem, (min-width: 640px) 24rem, 90vw"
                placeholder="blur"
                loading="eager"
                fetchPriority="high"
                className="aspect-[4/5] h-auto w-full object-cover"
              />
            </div>
            <p className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm shadow-card">
              <MapPin size={15} aria-hidden="true" className="text-accent" />
              <span className="sr-only">{dict.hero.basedIn} </span>
              {t(profile.location, locale)}
            </p>
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="container-page">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-surface px-6 py-5">
                  <dt className="text-sm text-muted">{stat.label}</dt>
                  <dd className="display order-first text-4xl tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      {/* Value & about */}
      <section aria-labelledby="value-title" className="container-page mt-24 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHeading id="value-title" eyebrow={dict.home.aboutTitle} title={dict.home.valueTitle} />
        </div>
        <div className="space-y-5 text-lg leading-relaxed" data-reveal>
          {t(profile.valueProposition, locale) ? <p className="text-ink">{t(profile.valueProposition, locale)}</p> : null}
          {t(profile.about, locale) ? <p className="text-muted">{t(profile.about, locale)}</p> : null}
        </div>
      </section>

      {/* Focus areas */}
      <section aria-labelledby="focus-title" className="container-page mt-24">
        <SectionHeading id="focus-title" eyebrow="01" title={dict.home.focusTitle} />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.skills.map((group, index) => (
            <li key={group.id} className="card p-6 transition-colors hover:border-line-strong" data-reveal>
              <p className="font-display text-sm text-accent tabular-nums">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{t(group.name, locale)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {group.skills
                  .slice(0, 4)
                  .map((skill) => t(skill.name, locale))
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent experience */}
      <section aria-labelledby="experience-title" className="container-page mt-24">
        <SectionHeading
          id="experience-title"
          eyebrow="02"
          title={dict.home.experienceTitle}
          action={
            <Link href={`/${locale}/cv#experience`} className="btn btn-secondary">
              {dict.home.experienceAll}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-12">
          <ExperienceTimeline items={recent} locale={locale} dict={dict.cv} compact />
        </div>
      </section>

      {/* Featured projects */}
      {featured.length > 0 ? (
        <section aria-labelledby="projects-title" className="container-page mt-24">
          <SectionHeading
            id="projects-title"
            eyebrow="03"
            title={dict.home.projectsTitle}
            action={
              <Link href={`/${locale}/portfolio`} className="btn btn-secondary">
                {dict.home.projectsAll}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            }
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} locale={locale} dict={dict.portfolio} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Call to action */}
      <section aria-labelledby="cta-title" className="container-page mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-bg sm:px-14" data-reveal>
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/30 blur-3xl" />
          <h2 id="cta-title" className="display relative max-w-2xl text-3xl sm:text-5xl">
            {dict.home.ctaTitle}
          </h2>
          <p className="relative mt-4 max-w-xl text-bg/75">{dict.home.ctaText}</p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/contact`} className="btn bg-bg text-ink hover:bg-accent hover:text-on-accent">
              {dict.hero.contactMe}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href={`mailto:${contact.email}`} className="btn border border-bg/30 text-bg hover:border-bg">
              {contact.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
