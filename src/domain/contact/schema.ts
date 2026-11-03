import { z } from "zod";
import { LOCALES } from "@/i18n/config";

/** Minimum time a human needs to fill in the form; faster submissions are treated as bots. */
export const MIN_FILL_MS = 3000;

export const contactInputSchema = z.object({
  name: z.string().trim().min(2, "name_short").max(100, "name_long"),
  email: z.email("email_invalid").max(254, "email_invalid"),
  subject: z.string().trim().max(150, "subject_long").default(""),
  message: z.string().trim().min(20, "message_short").max(5000, "message_long"),
  consent: z.literal(true, "consent_required"),
  locale: z.enum(LOCALES),
  /** Honeypot: hidden from humans, bots tend to fill it. */
  website: z.string().max(200).default(""),
  /** Epoch millis when the form was rendered. */
  startedAt: z.coerce.number().int().nonnegative(),
});

export type ContactInput = z.infer<typeof contactInputSchema>;

/**
 * honeypot → silently dropped (bots get a fake success). too_fast → visible "try again" error,
 * because a fast human must never lose a message silently. Old forms (tab left open) are accepted.
 */
export type SpamVerdict = "ok" | "honeypot" | "too_fast";

export function spamVerdict(input: Pick<ContactInput, "website" | "startedAt">, now = Date.now()): SpamVerdict {
  if (input.website.trim() !== "") return "honeypot";
  const elapsed = now - input.startedAt;
  if (elapsed < MIN_FILL_MS) return "too_fast";
  return "ok";
}
