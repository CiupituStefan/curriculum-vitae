import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { t } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Project } from "@/domain/projects/schema";
import { ProjectCover } from "./project-cover";

export function ProjectCard({ project, locale, dict, headingLevel = "h3" }: { project: Project; locale: Locale; dict: Dictionary["portfolio"]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong" data-reveal>
      <div className="aspect-[16/10] overflow-hidden border-b border-line">
        <ProjectCover project={project} locale={locale} label={dict.categories[project.category]} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold uppercase tracking-wider text-accent">{dict.categories[project.category]}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </div>
        <Heading className="mt-3 text-lg font-semibold leading-snug tracking-tight">
          <Link href={`/${locale}/portfolio/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(project.title, locale)}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{t(project.summary, locale)}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={dict.technologies}>
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-ink">
          {dict.readCaseStudy}
          <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
