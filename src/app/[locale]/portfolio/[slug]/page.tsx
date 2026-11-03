import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { isLocale, t, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { slugSchema } from "@/domain/projects/schema";
import { getCvContent } from "@/server/services/content-service";
import { getPublishedProject, getPublishedProjects } from "@/server/services/project-service";
import { ProjectCover } from "@/components/portfolio/project-cover";
import { Gallery } from "@/components/portfolio/gallery";
import { GitHubIcon } from "@/components/icons/brand";

type Props = { params: Promise<{ locale: string; slug: string }> };

async function load(params: Props["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !slugSchema.safeParse(slug).success) return null;
  const project = await getPublishedProject(slug);
  return project ? { locale, project } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await load(params);
  if (!loaded) return {};
  const { locale, project } = loaded;
  const { content } = await getCvContent();
  return pageMetadata({
    locale,
    path: `/portfolio/${project.slug}`,
    title: t(project.title, locale),
    description: t(project.summary, locale).slice(0, 160),
    siteName: content.profile.fullName,
    type: "article",
    image: project.cover ? mediaUrl(project.cover.path) : undefined,
  });
}

function sizeLabel(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function ProjectPage({ params }: Props) {
  const loaded = await load(params);
  if (!loaded) notFound();
  const { project } = loaded;
  const locale: Locale = loaded.locale;
  const dict = getDictionary(locale);
  const P = dict.portfolio;
  const all = await getPublishedProjects();
  const position = all.findIndex((item) => item.id === project.id);
  const next = all.length > 1 ? all[(position + 1) % all.length] : undefined;

  const story = [
    { key: "overview", title: P.overview, body: t(project.description, locale) },
    { key: "objective", title: P.objective, body: t(project.objective, locale) },
    { key: "problem", title: P.problem, body: t(project.problem, locale) },
    { key: "contribution", title: P.contribution, body: t(project.contribution, locale) },
    { key: "process", title: P.process, body: t(project.process, locale) },
    { key: "results", title: P.results, body: t(project.results, locale) },
  ].filter((block) => block.body);

  const links = [
    project.liveUrl && { href: project.liveUrl, label: P.live, icon: <ArrowUpRight size={16} aria-hidden="true" /> },
    project.repoUrl && { href: project.repoUrl, label: P.repo, icon: <GitHubIcon size={16} /> },
    project.docsUrl && { href: project.docsUrl, label: P.docs, icon: <FileText size={16} aria-hidden="true" /> },
  ].filter((link): link is { href: string; label: string; icon: React.ReactElement } => Boolean(link));

  return (
    <article className="container-page pt-10 md:pt-14">
      <Link href={`/${locale}/portfolio`} className="btn btn-ghost -ml-3">
        <ArrowLeft size={16} aria-hidden="true" />
        {P.back}
      </Link>

      <header className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="eyebrow">{P.categories[project.category]}</p>
          <h1 className="display mt-4 text-4xl sm:text-6xl">{t(project.title, locale)}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t(project.summary, locale)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
          <div className="bg-surface p-5">
            <dt className="text-muted">{P.year}</dt>
            <dd className="mt-1 font-semibold tabular-nums">{project.year}</dd>
          </div>
          <div className="bg-surface p-5">
            <dt className="text-muted">{P.category}</dt>
            <dd className="mt-1 font-semibold">{P.categories[project.category]}</dd>
          </div>
          {t(project.role, locale) ? (
            <div className="col-span-2 bg-surface p-5">
              <dt className="text-muted">{P.role}</dt>
              <dd className="mt-1 font-semibold">{t(project.role, locale)}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="mt-12 aspect-[21/9] overflow-hidden rounded-[2rem] border border-line">
        <ProjectCover project={project} locale={locale} label={P.categories[project.category]} sizes="(min-width: 1152px) 72rem, 100vw" priority />
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
        <div className="space-y-12">
          {story.map((block, index) => (
            <section key={block.key} aria-labelledby={`${block.key}-title`} data-reveal>
              <p className="font-display text-sm tabular-nums text-accent">{String(index + 1).padStart(2, "0")}</p>
              <h2 id={`${block.key}-title`} className="display mt-2 text-2xl sm:text-3xl">
                {block.title}
              </h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/90">{block.body}</p>
            </section>
          ))}

          {project.gallery.length > 0 ? (
            <section aria-labelledby="gallery-title">
              <h2 id="gallery-title" className="display text-2xl sm:text-3xl">
                {P.gallery}
              </h2>
              <div className="mt-6">
                <Gallery
                  images={project.gallery.map((image) => ({
                    src: mediaUrl(image.path),
                    alt: t(image.alt, locale) || t(project.title, locale),
                    width: image.width,
                    height: image.height,
                  }))}
                  labels={{ open: P.openImage, close: P.closeImage, previous: P.previousImage, next: P.nextImage }}
                />
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          {project.technologies.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{P.technologies}</h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {links.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{P.links}</h2>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full justify-between">
                      {link.label}
                      {link.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {project.attachments.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{P.documents}</h2>
              <ul className="mt-3 space-y-2">
                {project.attachments.map((file) => (
                  <li key={file.path}>
                    <a
                      href={mediaUrl(file.path, file.name)}
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-line-strong"
                    >
                      <FileText size={18} aria-hidden="true" className="shrink-0 text-accent" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-muted">PDF · {sizeLabel(file.size)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {next ? (
        <nav aria-label={P.nextProject} className="mt-24 border-t border-line pt-10">
          <Link href={`/${locale}/portfolio/${next.slug}`} className="group flex items-end justify-between gap-6">
            <span>
              <span className="text-sm text-muted">{P.nextProject}</span>
              <span className="display mt-2 block text-3xl transition-colors group-hover:text-accent sm:text-4xl">{t(next.title, locale)}</span>
            </span>
            <ArrowRight size={28} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        </nav>
      ) : null}
    </article>
  );
}
