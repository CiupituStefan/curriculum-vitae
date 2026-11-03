import { z } from "zod";

/** Localized string with an upper bound on length (defence against oversized payloads). */
export const localized = (max = 2000) =>
  z.object({
    ro: z.string().trim().max(max),
    en: z.string().trim().max(max),
  });

export const requiredLocalized = (max = 2000) =>
  z.object({
    ro: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
  });

/** Only http(s) links are accepted: blocks javascript:, data:, vbscript: and similar XSS vectors. */
export const safeUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "invalid_url");

export const optionalUrl = z.union([z.literal(""), safeUrl]).default("");

/** Month precision date: YYYY-MM. */
export const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "invalid_month");
export const optionalYearMonth = z.union([z.literal(""), yearMonth]).default("");

export const id = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "invalid_id");

export const email = z.email().max(254);

export const shortText = z.string().trim().max(200);
