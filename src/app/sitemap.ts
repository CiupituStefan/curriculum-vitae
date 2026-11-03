import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { siteUrl } from "@/lib/env";
import { getPublishedProjects } from "@/server/services/project-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  const paths = ["", "/cv", "/portfolio", "/contact", "/privacy", ...projects.map((p) => `/portfolio/${p.slug}`)];
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/cv" ? 0.9 : 0.7,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    })),
  );
}
export const revalidate = 3600;
