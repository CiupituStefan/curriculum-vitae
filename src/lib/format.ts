import type { Locale } from "@/i18n/config";

const MONTHS: Record<Locale, string[]> = {
  ro: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "2026-01" → "ian. 2026" / "Jan 2026". Empty input → "". */
export function formatMonth(value: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return "";
  const month = MONTHS[locale][Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : match[1]!;
}

/** Formats a period. An empty end means ongoing ("prezent" / "present"). */
export function formatPeriod(
  start: string,
  end: string,
  locale: Locale,
  presentLabel: string,
  ongoing = !end,
): string {
  const from = formatMonth(start, locale);
  const to = end ? formatMonth(end, locale) : ongoing ? presentLabel : "";
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

/** Machine-readable value for <time dateTime>. */
export function isoMonth(value: string): string | undefined {
  return /^\d{4}-\d{2}$/.test(value) ? value : undefined;
}

/** Sort key: ongoing entries first, then most recent end/start. */
export function recencyKey(start: string, end: string): string {
  return `${end || "9999-12"}|${start}`;
}
