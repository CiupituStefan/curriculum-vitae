"use server";

import { headers } from "next/headers";
import { toErrorCode, AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { submitContact } from "@/server/services/contact-service";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: string; fieldErrors?: Record<string, string> };

/** Server Action for the contact form. Next.js verifies the Origin header (CSRF protection). */
export async function sendContactMessage(_previous: ContactState, formData: FormData): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
    locale: formData.get("locale"),
    website: formData.get("website") ?? "",
    startedAt: formData.get("startedAt"),
  };
  try {
    await submitContact(raw, await headers());
    return { status: "success" };
  } catch (error) {
    const code = toErrorCode(error);
    if (code === "internal") logger.error("contact.failed", { error });
    return {
      status: "error",
      code,
      fieldErrors: error instanceof AppError ? error.fieldErrors : undefined,
    };
  }
}
