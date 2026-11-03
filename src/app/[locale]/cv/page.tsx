import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatPeriod, recencyKey } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getCvContent } from "@/server/services/content-service";
import { getPublishedProjects } from "@/server/services/project-service";
import { ExperienceTimeline } from "@/components/cv/experience-timeline";
import { DownloadCvDialog } from "@/components/site/download-dialog";
import { SocialLinks } from "@/components/site/social-links";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  return pageMetadata({
    locale,
    path: "/cv",
    title: dict.meta.cvTitle,
    description: dict.meta.cvDescription,
    siteName: content.profile.fullName,
    type: "profile",
  });
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-line pt-10">
      <h2 id={`${id}-title`} className="display text-2xl sm:text-3xl" data-reveal>
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function CvPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const L = dict.cv;
  const [{ content }, projects] = await Promise.all([getCvContent(), getPublishedProjects()]);
  const { profile, contact } = content;
  const experience = [...content.experience].sort((a, b) =>
    recencyKey(b.start, b.end).localeCompare(recencyKey(a.start, a.end)),
  );

  const certGroups = new Map<string, typeof content.certifications>();
  for (const cert of content.certifications) {
    const group = t(cert.group, locale) || L.sections.certifications;
    certGroups.set(group, [...(certGroups.get(group) ?? []), cert]);
  }

  const sections = [
    { id: "profile", title: L.sections.profile, show: true },
    { id: "experience", title: L.sections.experience, show: experience.length > 0 },
    { id: "education", title: L.sections.education, show: content.education.length > 0 },
    { id: "skills", title: L.sections.skills, show: content.skills.length > 0 },
    { id: "personal-skills", title: L.sections.personalSkills, show: content.personalSkills.length > 0 },
    { id: "languages", title: L.sections.languages, show: content.languages.length > 0 },
    { id: "certifications", title: L.sections.certifications, show: content.certifications.length > 0 },
    { id: "courses", title: L.sections.courses, show: content.courses.length > 0 },
    { id: "projects", title: L.sections.projects, show: projects.length > 0 },
    { id: "volunteering", title: L.sections.volunteering, show: content.volunteering.length > 0 },
    { id: "awards", title: L.sections.awards, show: content.awards.length > 0 },
    { id: "other", title: L.sections.otherInfo, show: content.otherInfo.length > 0 },
    { id: "contact", title: L.sections.contact, show: true },
  ].filter((section) => section.show);

  return (
    <div className="container-page pt-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{profile.fullName}</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">{L.title}</h1>
        <p className="mt-5 text-lg text-muted">{L.intro}</p>
        <div className="mt-8">
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
        </div>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <nav aria-label={L.onThisPage} className="hidden lg:block" data-print-hide>
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{L.onThisPage}</p>
            <ol className="mt-4 space-y-1 border-l border-line">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:border-ink hover:text-ink">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0 space-y-16">
          <Section id="profile" title={L.sections.profile}>
            <div className="prose-cv max-w-3xl text-lg leading-relaxed" data-reveal>
              <p>{t(profile.summary, locale)}</p>
              {t(profile.about, locale) ? <p className="text-muted">{t(profile.about, locale)}</p> : null}
            </div>
          </Section>

          {experience.length > 0 ? (
            <Section id="experience" title={L.sections.experience}>
              <ExperienceTimeline items={experience} locale={locale} dict={L} />
            </Section>
          ) : null}

          {content.education.length > 0 ? (
            <Section id="education" title={L.sections.education}>
              <ul className="grid gap-4 md:grid-cols-2">
                {content.education.map((item) => (
                  <li key={item.id} className="card p-6" data-reveal>
                    <p className="text-sm tabular-nums text-muted">
                      {item.ongoing ? (
                        <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">{L.ongoing}</span>
                      ) : null}
                      {formatPeriod(item.start, item.end, locale, L.present, item.ongoing)}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">{t(item.degree, locale)}</h3>
                    <p className="text-sm text-muted">{t(item.institution, locale)}</p>
                    <dl className="mt-4 space-y-1 text-sm">
                      {t(item.field, locale) ? (
                        <div>
                          <dt className="inline text-muted">{L.field}: </dt>
                          <dd className="inline">{t(item.field, locale)}</dd>
                        </div>
                      ) : null}
                      {t(item.specialization, locale) ? (
                        <div>
                          <dt className="inline text-muted">{L.specialization}: </dt>
                          <dd className="inline font-medium">{t(item.specialization, locale)}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {t(item.details, locale) ? <p className="mt-3 text-sm text-muted">{t(item.details, locale)}</p> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {content.skills.length > 0 ? (
            <Section id="skills" title={L.sections.skills}>
              <div className="grid gap-4 md:grid-cols-2">
                {content.skills.map((group) => (
                  <div key={group.id} className="card p-6" data-reveal>
                    <h3 className="font-semibold tracking-tight">{t(group.name, locale)}</h3>
                    <ul className="mt-4 divide-y divide-line">
                      {group.skills.map((skill) => (
                        <li key={skill.name.en} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                          <span>
                            {t(skill.name, locale)}
                            {t(skill.detail, locale) ? <span className="block text-xs text-muted">{t(skill.detail, locale)}</span> : null}
                          </span>
                          {skill.level ? (
                            <span className="shrink-0 text-xs font-medium text-muted">
                              <span className="sr-only">: </span>
                              {L.levels[skill.level]}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {content.personalSkills.length > 0 ? (
            <Section id="personal-skills" title={L.sections.personalSkills}>
              <ul className="flex flex-wrap gap-2" data-reveal>
                {content.personalSkills.map((skill) => (
                  <li key={skill.en} className="rounded-full border border-line bg-surface px-4 py-2 text-sm">
                    {t(skill, locale)}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {content.languages.length > 0 ? (
            <Section id="languages" title={L.sections.languages}>
              <div className="grid gap-4 md:grid-cols-3">
                {content.languages.map((language) => {
                  const levels = (["listening", "reading", "spokenInteraction", "spokenProduction", "writing"] as const).filter((key) => language[key]);
                  return (
                    <div key={language.id} className="card p-6" data-reveal>
                      <h3 className="font-semibold">{t(language.name, locale)}</h3>
                      {language.native ? (
                        <p className="mt-1 text-sm text-accent">{L.native}</p>
                      ) : (
                        <dl className="mt-3 space-y-1 text-sm">
                          {levels.map((key) => (
                            <div key={key} className="flex justify-between gap-4">
                              <dt className="text-muted">{L.cefr[key]}</dt>
                              <dd className="font-medium tabular-nums">{language[key]}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted">{L.cefrNote}</p>
            </Section>
          ) : null}

          {content.certifications.length > 0 ? (
            <Section id="certifications" title={`${L.sections.certifications} (${content.certifications.length})`}>
              <div className="space-y-8">
                {[...certGroups.entries()].map(([group, certs]) => (
                  <div key={group} data-reveal>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                      {group} · {certs.length}
                    </h3>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {certs.map((cert) => (
                        <li key={cert.id} className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
                          {cert.url ? (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                              {t(cert.name, locale)}
                            </a>
                          ) : (
                            t(cert.name, locale)
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {content.courses.length > 0 ? (
            <Section id="courses" title={L.sections.courses}>
              <ul className="space-y-4">
                {content.courses.map((course) => (
                  <li key={course.id} className="card p-6" data-reveal>
                    <p className="text-sm tabular-nums text-muted">
                      {course.ongoing ? (
                        <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">{L.ongoing}</span>
                      ) : null}
                      {formatPeriod(course.start, course.end, locale, L.present, course.ongoing)}
                    </p>
                    <h3 className="mt-2 font-semibold tracking-tight">{t(course.name, locale)}</h3>
                    <p className="text-sm text-muted">{t(course.provider, locale)}</p>
                    {t(course.description, locale) ? <p className="mt-3 text-sm leading-relaxed">{t(course.description, locale)}</p> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {projects.length > 0 ? (
            <Section id="projects" title={L.sections.projects}>
              <ul className="divide-y divide-line border-y border-line">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link href={`/${locale}/portfolio/${project.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                      <span>
                        <span className="font-medium group-hover:text-accent">{t(project.title, locale)}</span>
                        <span className="mt-1 block text-sm text-muted">{project.technologies.slice(0, 4).join(" · ")}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums text-muted">
                        {project.year}
                        <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {content.volunteering.length > 0 ? (
            <Section id="volunteering" title={L.sections.volunteering}>
              <ul className="space-y-4">
                {content.volunteering.map((item) => (
                  <li key={item.id} className="card p-6" data-reveal>
                    <p className="text-sm tabular-nums text-muted">{formatPeriod(item.start, item.end, locale, L.present, false)}</p>
                    <h3 className="mt-2 font-semibold tracking-tight">
                      {t(item.role, locale)} · {item.organization}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted">{t(item.description, locale)}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {content.awards.length > 0 ? (
            <Section id="awards" title={L.sections.awards}>
              <ul className="space-y-4">
                {content.awards.map((award) => (
                  <li key={award.id} className="card p-6" data-reveal>
                    <h3 className="font-semibold tracking-tight">{t(award.title, locale)}</h3>
                    <p className="text-sm text-muted">
                      {[award.issuer, formatPeriod(award.date, "", locale, "", false)].filter(Boolean).join(" · ")}
                    </p>
                    {t(award.description, locale) ? <p className="mt-3 text-sm">{t(award.description, locale)}</p> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {content.otherInfo.length > 0 ? (
            <Section id="other" title={L.sections.otherInfo}>
              <dl className="space-y-4">
                {content.otherInfo.map((info) => (
                  <div key={info.id} data-reveal>
                    <dt className="font-semibold">{t(info.title, locale)}</dt>
                    <dd className="mt-1 text-muted">{t(info.description, locale)}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          ) : null}

          <Section id="contact" title={L.sections.contact}>
            <div className="grid gap-6 md:grid-cols-2" data-reveal>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Mail size={18} aria-hidden="true" className="text-accent" />
                  <a href={`mailto:${contact.email}`} className="link-underline">
                    {contact.email}
                  </a>
                </li>
                {contact.showPhone && contact.phone ? (
                  <li className="flex items-center gap-3">
                    <Phone size={18} aria-hidden="true" className="text-accent" />
                    <a href={`tel:${contact.phone.replace(/[^+0-9]/g, "")}`} className="link-underline">
                      {contact.phone}
                    </a>
                  </li>
                ) : null}
                <li className="flex items-center gap-3">
                  <MapPin size={18} aria-hidden="true" className="text-accent" />
                  {t(profile.location, locale)}
                </li>
              </ul>
              <SocialLinks contact={contact} withLabels />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
