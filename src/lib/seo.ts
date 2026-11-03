import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/config";
import { siteUrl } from "./env";

const OG_LOCALE: Record<Locale, string> = { ro: "ro_RO", en: "en_US" };

/**
 * Per-page metadata: canonical URL, hreflang alternates for both languages (+ x-default),
 * Open Graph and Twitter cards. `path` is the locale-less path, e.g. "/cv".
 */
export function pageMetadata(options: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  siteName: string;
  image?: string;
  type?: "website" | "profile" | "article";
}): Metadata {
  const { locale, path, title, description, siteName } = options;
  const clean = path === "/" ? "" : path;
  const languages = Object.fromEntries(LOCALES.map((value) => [value, `${siteUrl}/${value}${clean}`]));
  const image = options.image ?? `${siteUrl}/${locale}/opengraph-image`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}${clean}`,
      languages: { ...languages, "x-default": `${siteUrl}/ro${clean}` },
    },
    openGraph: {
      type: options.type ?? "website",
      url: `${siteUrl}/${locale}${clean}`,
      siteName,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((value) => value !== locale).map((value) => OG_LOCALE[value]),
      images: [{ url: image, width: 1200, height: 630, alt: siteName }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
