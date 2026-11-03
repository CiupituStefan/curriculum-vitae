import { isLocale } from "@/i18n/config";
import { siteUrl } from "@/lib/env";
import { logger } from "@/lib/logger";
import { isCvFormat } from "@/pdf/formats";
import { cvFileName, renderCvPdf } from "@/pdf/render";
import { getCvContent } from "@/server/services/content-service";
import { getPublishedProjects } from "@/server/services/project-service";

export const runtime = "nodejs";

/**
 * GET /api/cv/{ro|en}/{modern|europass|ats|print}
 * Generates the PDF from the current content on every request, so downloads are always in sync
 * with the online CV. `?inline=1` displays it in the browser instead of downloading.
 */
export async function GET(request: Request, { params }: { params: Promise<{ locale: string; format: string }> }) {
  const { locale, format } = await params;
  if (!isLocale(locale) || !isCvFormat(format)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  try {
    const [{ content }, projects] = await Promise.all([getCvContent(), getPublishedProjects()]);
    const pdf = await renderCvPdf(format, locale, content, projects, siteUrl);
    const inline = new URL(request.url).searchParams.get("inline") === "1";
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${cvFileName(format, locale)}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error("cv.pdf_failed", { format, locale, error });
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
