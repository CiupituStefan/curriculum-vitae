import "server-only";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { contactInputSchema, spamVerdict } from "@/domain/contact/schema";
import { messageRepository } from "@/server/repositories/message-repository";
import { serviceClient, sessionClient } from "@/server/supabase/clients";
import { requireAdmin } from "@/server/auth";
import { enforceRateLimit } from "./rate-limit-service";
import { sendContactNotification } from "./email-service";

export type ContactOutcome = { delivered: true };

/**
 * Handles a contact-form submission:
 * validation → spam heuristics → rate limit → persistence → optional e-mail notification.
 * Bots that trip the honeypot get a fake success so they learn nothing; submissions faster
 * than a human can type get a visible "try again" error instead of being dropped silently.
 */
export async function submitContact(raw: unknown, headers: Headers): Promise<ContactOutcome> {
  const parsed = contactInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
    );
    throw new AppError("validation", "Invalid contact form", fieldErrors);
  }
  const input = parsed.data;
  const verdict = spamVerdict(input);
  if (verdict === "honeypot") {
    logger.info("contact.spam_blocked", { verdict });
    return { delivered: true };
  }
  if (verdict === "too_fast") throw new AppError("too_fast");

  await enforceRateLimit("contact", headers);

  const record = {
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
    locale: input.locale,
  };
  await messageRepository.insert(serviceClient(), record);
  const emailed = await sendContactNotification(record);
  logger.info("contact.received", { emailed });
  return { delivered: true };
}

export async function listMessages() {
  await requireAdmin();
  return messageRepository.list(await sessionClient());
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new AppError("validation");
  await messageRepository.remove(await sessionClient(), id);
}
