import "server-only";
import { logger } from "@/lib/logger";
import { serverEnv } from "@/server/env.server";

/** Sends a notification e-mail through the Resend HTTP API (no SDK needed). Optional integration. */
export async function sendContactNotification(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = serverEnv;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: input.email,
        subject: `[ciupiustefan.com] ${input.subject || "Mesaj nou / New message"}`.slice(0, 200),
        // Plain text only: no HTML rendering of visitor input, so no HTML injection in the inbox.
        text: `${input.name} <${input.email}>\n\n${input.message}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      logger.warn("email.send_failed", { status: response.status });
      return false;
    }
    return true;
  } catch (error) {
    logger.warn("email.send_error", { error });
    return false;
  }
}
