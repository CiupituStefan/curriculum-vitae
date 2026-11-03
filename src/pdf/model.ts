import type { Locale } from "@/i18n/config";
import { t } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatPeriod, recencyKey } from "@/lib/format";
import type { CvContent } from "@/domain/content/schema";
import type { Project } from "@/domain/projects/schema";

/*
 * Locale-resolved, format-agnostic view model of the CV. All four PDF templates render from
 * this single model, which guarantees that every format contains the same, current content.
 */

export type PdfEntry = {
  title: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
  bullets: string[];
  tags: string[];
};

export type PdfModel = {
  locale: Locale;
  name: string;
  headline: string;
  summary: string;
  contact: { label: string; value: string; href?: string }[];
  labels: ReturnType<typeof getDictionary>["cv"];
  experience: PdfEntry[];
  education: PdfEntry[];
  skills: { group: string; items: string[] }[];
  personalSkills: string[];
  languages: { name: string; native: boolean; levels: { label: string; value: string }[] }[];
  certifications: { group: string; items: string[] }[];
  courses: PdfEntry[];
  projects: { title: string; year: number; summary: string; tech: string[] }[];
  /** Non-featured projects, listed compactly by title only to keep the PDF concise. */
  otherProjects: string[];
  volunteering: PdfEntry[];
  awards: PdfEntry[];
  otherInfo: { title: string; description: string }[];
  siteUrl: string;
};

const byRecency = <T extends { start: string; end: string }>(a: T, b: T) =>
  recencyKey(b.start, b.end).localeCompare(recencyKey(a.start, a.end));

export function buildPdfModel(content: CvContent, projects: Project[], locale: Locale, siteUrl: string): PdfModel {
  const dict = getDictionary(locale);
  const labels = dict.cv;
  const present = labels.present;
  const { profile, contact } = content;

  const contactLines: PdfModel["contact"] = [
    { label: "E-mail", value: contact.email, href: `mailto:${contact.email}` },
  ];
  if (contact.showPhoneInPdf && contact.phone) {
    contactLines.push({ label: locale === "ro" ? "Telefon" : "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/[^+0-9]/g, "")}` });
  }
  contactLines.push({ label: locale === "ro" ? "Locație" : "Location", value: t(profile.location, locale) });
  const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  if (contact.linkedin) contactLines.push({ label: "LinkedIn", value: strip(contact.linkedin), href: contact.linkedin });
  if (contact.github) contactLines.push({ label: "GitHub", value: strip(contact.github), href: contact.github });
  contactLines.push({ label: "Web", value: strip(siteUrl), href: siteUrl });

  const certGroups = new Map<string, string[]>();
  for (const cert of content.certifications) {
    const group = t(cert.group, locale) || labels.sections.certifications;
    certGroups.set(group, [...(certGroups.get(group) ?? []), t(cert.name, locale)]);
  }

  return {
    locale,
    name: profile.fullName,
    headline: t(profile.headline, locale),
    summary: t(profile.summary, locale),
    contact: contactLines,
    labels,
    experience: [...content.experience].sort(byRecency).map((item) => ({
      title: t(item.role, locale),
      organization: item.organization,
      period: formatPeriod(item.start, item.end, locale, present),
      location: t(item.location, locale),
      summary: t(item.summary, locale),
      bullets: [...item.responsibilities, ...item.achievements].map((entry) => t(entry, locale)),
      tags: item.skills,
    })),
    education: content.education.map((item) => ({
      title: t(item.degree, locale),
      organization: t(item.institution, locale),
      period: formatPeriod(item.start, item.end, locale, present, item.ongoing),
      location: t(item.location, locale),
      summary: [
        t(item.field, locale) && `${labels.field}: ${t(item.field, locale)}`,
        t(item.specialization, locale) && `${labels.specialization}: ${t(item.specialization, locale)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      bullets: t(item.details, locale) ? [t(item.details, locale)] : [],
      tags: [],
    })),
    skills: content.skills.map((group) => ({
      group: t(group.name, locale),
      items: group.skills.map((skill) => {
        const detail = t(skill.detail, locale);
        const level = skill.level ? labels.levels[skill.level] : "";
        return [t(skill.name, locale), detail && `(${detail})`, level && `— ${level}`].filter(Boolean).join(" ");
      }),
    })),
    personalSkills: content.personalSkills.map((skill) => t(skill, locale)),
    languages: content.languages.map((language) => ({
      name: t(language.name, locale),
      native: language.native,
      levels: (["listening", "reading", "spokenInteraction", "spokenProduction", "writing"] as const).map((key) => ({
        label: labels.cefr[key],
        value: language[key],
      })),
    })),
    certifications: [...certGroups.entries()].map(([group, items]) => ({ group, items })),
    courses: content.courses.map((course) => ({
      title: t(course.name, locale),
      organization: t(course.provider, locale),
      period: formatPeriod(course.start, course.end, locale, present, course.ongoing),
      location: "",
      summary: t(course.description, locale),
      bullets: [],
      tags: [],
    })),
    projects: projects
      .filter((project) => project.status === "published" && project.featured)
      .map((project) => ({
        title: t(project.title, locale),
        year: project.year,
        summary: t(project.summary, locale),
        tech: project.technologies,
      })),
    otherProjects: projects
      .filter((project) => project.status === "published" && !project.featured)
      .map((project) => `${t(project.title, locale)} (${project.year})`),
    volunteering: content.volunteering.map((item) => ({
      title: t(item.role, locale),
      organization: item.organization,
      period: formatPeriod(item.start, item.end, locale, present, false),
      location: t(item.location, locale),
      summary: t(item.description, locale),
      bullets: [],
      tags: [],
    })),
    awards: content.awards.map((award) => ({
      title: t(award.title, locale),
      organization: award.issuer,
      period: formatPeriod(award.date, award.date, locale, present, false).split(" – ")[0] ?? "",
      location: "",
      summary: t(award.description, locale),
      bullets: [],
      tags: [],
    })),
    otherInfo: content.otherInfo.map((info) => ({
      title: t(info.title, locale),
      description: t(info.description, locale),
    })),
    siteUrl,
  };
}
