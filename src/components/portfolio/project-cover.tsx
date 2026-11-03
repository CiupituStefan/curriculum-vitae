import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { t } from "@/i18n/config";
import { mediaUrl } from "@/lib/media";
import type { Project, ProjectCategory } from "@/domain/projects/schema";

/* Typographic cover used when no image has been uploaded — no stock or invented imagery. */
const PATTERNS: Record<ProjectCategory, string> = {
  hardware: "M0 20h40M20 0v40M10 10h20v20H10z",
  rf: "M20 4a16 16 0 0 1 0 32M20 10a10 10 0 0 1 0 20M20 16a4 4 0 0 1 0 8",
  embedded: "M8 8h24v24H8zM14 2v6M20 2v6M26 2v6M14 32v6M20 32v6M26 32v6",
  web: "M4 8h32v24H4zM4 14h32M9 11h1M13 11h1",
  security: "M20 4l13 5v9c0 9-6 15-13 18-7-3-13-9-13-18V9z",
  networking: "M20 6v28M6 20h28M10 10l20 20M30 10L10 30",
};

export function ProjectCover({ project, locale, sizes, label, priority = false }: { project: Project; locale: Locale; sizes: string; label: string; priority?: boolean }) {
  if (project.cover) {
    return (
      <Image
        src={mediaUrl(project.cover.path)}
        alt={t(project.cover.alt, locale)}
        width={project.cover.width}
        height={project.cover.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
      />
    );
  }
  return (
    <div aria-hidden="true" className="relative size-full overflow-hidden bg-surface-2">
      <svg className="absolute inset-0 size-full text-line-strong" role="presentation">
        <defs>
          <pattern id={`p-${project.slug}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d={PATTERNS[project.category]} fill="none" stroke="currentColor" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-${project.slug})`} opacity="0.55" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent-soft" />
      <p className="display absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-ink/70 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-y-1">
        <span className="text-xl italic">{label}</span>
        <span className="text-4xl tabular-nums text-accent/80">{project.year}</span>
      </p>
    </div>
  );
}
