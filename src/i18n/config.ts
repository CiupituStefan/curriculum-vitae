export const LOCALES = ["ro", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ro";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Bilingual text value. Every user-facing content string is stored in both languages. */
export type Localized = Record<Locale, string>;

export function t(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value[locale === "ro" ? "en" : "ro"] || "";
}

/** Negotiates the best locale from an Accept-Language header (RFC 9110 q-values). */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.trim().slice(2)) : 1;
      return { lang: tag.toLowerCase().split("-")[0] ?? "", quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  for (const entry of ranked) {
    if (isLocale(entry.lang)) return entry.lang;
  }
  return DEFAULT_LOCALE;
}
