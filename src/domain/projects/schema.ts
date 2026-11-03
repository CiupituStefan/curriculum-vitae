import { z } from "zod";
import { localized, optionalUrl, requiredLocalized, shortText } from "../content/primitives";

export const projectCategories = ["hardware", "rf", "embedded", "web", "security", "networking"] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "invalid_slug");

/** Object key inside a Supabase Storage bucket; generated server side, never user-controlled. */
export const storagePath = z
  .string()
  .max(300)
  .regex(/^projects\/[a-z0-9-]+\/[a-f0-9-]{36}\.(webp|pdf)$/, "invalid_path");

export const mediaSchema = z.object({
  path: storagePath,
  alt: localized(200),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
});

export const attachmentSchema = z.object({
  path: storagePath,
  name: z.string().trim().min(1).max(120),
  size: z.number().int().nonnegative(),
});

export const projectStatus = ["draft", "published"] as const;

/** Fields an administrator can edit through the dashboard form. */
export const projectInputSchema = z.object({
  slug: slugSchema,
  status: z.enum(projectStatus),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  category: z.enum(projectCategories),
  year: z.number().int().min(1990).max(2100),
  title: requiredLocalized(140),
  summary: requiredLocalized(400),
  description: localized(4000),
  objective: localized(2000),
  problem: localized(2000),
  role: localized(400),
  contribution: localized(3000),
  process: localized(4000),
  results: localized(3000),
  technologies: z.array(shortText.min(1)).max(30),
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  docsUrl: optionalUrl,
});

export const projectSchema = projectInputSchema.extend({
  id: z.string().min(1).max(64),
  cover: mediaSchema.nullable(),
  gallery: z.array(mediaSchema).max(24),
  attachments: z.array(attachmentSchema).max(12),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectMedia = z.infer<typeof mediaSchema>;
export type ProjectAttachment = z.infer<typeof attachmentSchema>;
