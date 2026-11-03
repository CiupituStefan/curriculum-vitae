import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";
import { projectCategories, type ProjectCategory } from "@/domain/projects/schema";
import { getCvContent } from "@/server/services/content-service";
import { getPublishedProjects } from "@/server/services/project-service";
import { ProjectCard } from "@/components/portfolio/project-card";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  const { content } = await getCvContent();
  return pageMetadata({
    locale,
    path: "/portfolio",
    title: dict.meta.portfolioTitle,
    description: dict.meta.portfolioDescription,
    siteName: content.profile.fullName,
  });
}

/* Category filtering is done with plain links and the URL (?category=…): it works without
   JavaScript, is shareable, and the active filter survives reloads. */
export default async function PortfolioPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const P = dict.portfolio;
  const query = (await searchParams).category;
  const requested = Array.isArray(query) ? query[0] : query;
  const active = projectCategories.find((category) => category === requested) as ProjectCategory | undefined;

  const projects = await getPublishedProjects();
  const available = projectCategories.filter((category) => projects.some((project) => project.category === category));
  const visible = active ? projects.filter((project) => project.category === active) : projects;

  const filters: { key: ProjectCategory | "all"; label: string; href: string; count: number }[] = [
    { key: "all", label: P.all, href: `/${locale}/portfolio`, count: projects.length },
    ...available.map((category) => ({
      key: category,
      label: P.categories[category],
      href: `/${locale}/portfolio?category=${category}`,
      count: projects.filter((project) => project.category === category).length,
    })),
  ];

  return (
    <div className="container-page pt-12 md:pt-16">
      <header className="max-w-3xl">
        <p className="eyebrow">{P.title}</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">{P.title}</h1>
        <p className="mt-5 text-lg text-muted">{P.intro}</p>
      </header>

      <nav aria-label={P.filterLabel} className="mt-10">
        <ul className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const current = (filter.key === "all" && !active) || filter.key === active;
            return (
              <li key={filter.key}>
                <Link
                  href={filter.href}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
                >
                  {filter.label}
                  <span className="tabular-nums opacity-70">{filter.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {visible.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="project-grid">
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} locale={locale} dict={P} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card mt-10 p-10 text-center">
          <p className="text-muted">{P.empty}</p>
          <Link href={`/${locale}/portfolio`} className="btn btn-secondary mt-6">
            {P.showAll}
          </Link>
        </div>
      )}
    </div>
  );
}
