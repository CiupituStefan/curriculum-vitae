import { z } from "zod";
import {
  email,
  id,
  localized,
  optionalUrl,
  optionalYearMonth,
  requiredLocalized,
  shortText,
  safeUrl,
  yearMonth,
} from "./primitives";

/*
 * Content model for the online CV.
 *
 * The CV is stored as a set of independently-editable sections (one row per section in
 * `public.cv_sections`). Every section is validated with these schemas on write (server side)
 * and on read, so the public site and the PDF generator only ever see well-formed data.
 */

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  headline: requiredLocalized(160),
  summary: requiredLocalized(600),
  about: localized(3000),
  valueProposition: localized(1200),
  location: localized(120),
  photoAlt: localized(200),
  focusAreas: z.array(requiredLocalized(80)).max(12),
});

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: safeUrl,
});

export const contactSchema = z.object({
  email,
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+()0-9 .-]*$/, "invalid_phone"),
  /** The phone number is published only when the owner explicitly opts in. */
  showPhone: z.boolean(),
  /** Whether the phone number is printed in the downloadable PDF CVs. */
  showPhoneInPdf: z.boolean(),
  linkedin: optionalUrl,
  github: optionalUrl,
  youtube: optionalUrl,
  otherLinks: z.array(socialLinkSchema).max(10),
});

export const experienceKinds = ["work", "research", "internship", "project", "exchange"] as const;

export const experienceSchema = z.object({
  id,
  kind: z.enum(experienceKinds),
  organization: z.string().trim().min(1).max(120),
  organizationUrl: optionalUrl,
  role: requiredLocalized(160),
  location: localized(120),
  start: yearMonth,
  /** Empty string = ongoing. */
  end: optionalYearMonth,
  summary: localized(800),
  responsibilities: z.array(requiredLocalized(600)).max(20),
  achievements: z.array(requiredLocalized(600)).max(20),
  skills: z.array(shortText).max(40),
});

export const educationSchema = z.object({
  id,
  institution: requiredLocalized(160),
  institutionUrl: optionalUrl,
  degree: requiredLocalized(160),
  field: localized(200),
  specialization: localized(200),
  location: localized(120),
  start: optionalYearMonth,
  end: optionalYearMonth,
  ongoing: z.boolean(),
  details: localized(1200),
});

export const skillLevels = ["advanced", "proficient", "foundational"] as const;

export const skillGroupSchema = z.object({
  id,
  name: requiredLocalized(80),
  skills: z
    .array(
      z.object({
        name: requiredLocalized(120),
        level: z.union([z.literal(""), z.enum(skillLevels)]).default(""),
        detail: localized(200),
      }),
    )
    .max(40),
});

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const cefr = z.enum(cefrLevels);

export const languageSchema = z.object({
  id,
  name: requiredLocalized(60),
  native: z.boolean(),
  listening: z.union([z.literal(""), cefr]).default(""),
  reading: z.union([z.literal(""), cefr]).default(""),
  spokenInteraction: z.union([z.literal(""), cefr]).default(""),
  spokenProduction: z.union([z.literal(""), cefr]).default(""),
  writing: z.union([z.literal(""), cefr]).default(""),
});

export const certificationSchema = z.object({
  id,
  name: requiredLocalized(160),
  issuer: z.string().trim().max(120),
  group: localized(80),
  date: optionalYearMonth,
  url: optionalUrl,
});

export const courseSchema = z.object({
  id,
  name: requiredLocalized(160),
  provider: localized(160),
  start: optionalYearMonth,
  end: optionalYearMonth,
  ongoing: z.boolean(),
  description: localized(1200),
});

export const volunteeringSchema = z.object({
  id,
  organization: z.string().trim().min(1).max(120),
  organizationUrl: optionalUrl,
  role: requiredLocalized(120),
  location: localized(120),
  start: optionalYearMonth,
  end: optionalYearMonth,
  description: localized(1200),
});

export const awardSchema = z.object({
  id,
  title: requiredLocalized(160),
  issuer: z.string().trim().max(120),
  date: optionalYearMonth,
  description: localized(800),
});

export const otherInfoSchema = z.object({
  id,
  title: requiredLocalized(120),
  description: requiredLocalized(800),
});

export const seoSchema = z.object({
  title: requiredLocalized(70),
  description: requiredLocalized(170),
});

/** Registry of every editable CV section and its schema. Single source of truth. */
export const sectionSchemas = {
  profile: profileSchema,
  contact: contactSchema,
  experience: z.array(experienceSchema).max(40),
  education: z.array(educationSchema).max(20),
  skills: z.array(skillGroupSchema).max(20),
  personalSkills: z.array(requiredLocalized(120)).max(30),
  languages: z.array(languageSchema).max(10),
  certifications: z.array(certificationSchema).max(80),
  courses: z.array(courseSchema).max(30),
  volunteering: z.array(volunteeringSchema).max(20),
  awards: z.array(awardSchema).max(30),
  otherInfo: z.array(otherInfoSchema).max(20),
  seo: seoSchema,
} as const;

export type SectionKey = keyof typeof sectionSchemas;
export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];

export type CvContent = { [K in SectionKey]: z.infer<(typeof sectionSchemas)[K]> };
export type Profile = CvContent["profile"];
export type Contact = CvContent["contact"];
export type Experience = CvContent["experience"][number];
export type Education = CvContent["education"][number];
export type SkillGroup = CvContent["skills"][number];
export type Language = CvContent["languages"][number];
export type Certification = CvContent["certifications"][number];
export type Course = CvContent["courses"][number];
export type Volunteering = CvContent["volunteering"][number];
export type Award = CvContent["awards"][number];
export type OtherInfo = CvContent["otherInfo"][number];

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === "string" && value in sectionSchemas;
}

export function parseSection<K extends SectionKey>(key: K, data: unknown) {
  return sectionSchemas[key].safeParse(data) as z.ZodSafeParseResult<CvContent[K]>;
}
