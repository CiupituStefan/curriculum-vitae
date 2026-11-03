import { AppError, HTTP_STATUS, toErrorCode } from "@/lib/errors";
import { findMessagesByEmail } from "@/server/services/contact-service";

export const dynamic = "force-dynamic";

/**
 * GET /admin/privacy-export?email=…  — admin only (requireAdmin inside the service).
 * Returns every stored record about one person as JSON, for access / portability requests
 * (GDPR art. 15 and 20). Never cached.
 */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? "";
  try {
    const records = await findMessagesByEmail(email);
    const body = JSON.stringify(
      {
        controller: "Ștefan-Emanuel Ciupitu — ciupitustefan.com",
        exportedAt: new Date().toISOString(),
        subject: email,
        categories: {
          contactMessages: records.map((record) => ({
            name: record.name,
            email: record.email,
            subject: record.subject,
            message: record.message,
            locale: record.locale,
            receivedAt: record.created_at,
            consentAt: record.consent_at,
            privacyPolicyVersion: record.privacy_version,
          })),
        },
      },
      null,
      2,
    );
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="date-personale-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const code = toErrorCode(error);
    return Response.json({ error: code }, { status: error instanceof AppError ? HTTP_STATUS[code] : 500 });
  }
}
