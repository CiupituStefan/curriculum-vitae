import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import type { Locale } from "@/i18n/config";
import type { CvContent } from "@/domain/content/schema";
import type { Project } from "@/domain/projects/schema";
import { registerPdfFonts } from "./fonts";
import { buildPdfModel } from "./model";
import { AtsCv } from "./templates/ats";
import { EuropassCv } from "./templates/europass";
import { ModernCv } from "./templates/modern";
import { CV_FORMATS, type CvFormat } from "./formats";

export { CV_FORMATS, type CvFormat };

let photoCache: Buffer | null | undefined;
async function loadPhoto(): Promise<Buffer | null> {
  if (photoCache !== undefined) return photoCache;
  try {
    photoCache = await readFile(path.join(process.cwd(), "public", "images", "stefan-ciupitu-square.jpg"));
  } catch {
    photoCache = null;
  }
  return photoCache;
}

/** Renders one CV variant to a PDF buffer (real, selectable text; embedded, subset fonts). */
export async function renderCvPdf(
  format: CvFormat,
  locale: Locale,
  content: CvContent,
  projects: Project[],
  siteUrl: string,
): Promise<Buffer> {
  registerPdfFonts();
  const model = buildPdfModel(content, projects, locale, siteUrl);
  const photo = format === "modern" || format === "europass" ? await loadPhoto() : null;
  const element =
    format === "ats" ? (
      <AtsCv model={model} />
    ) : format === "europass" ? (
      <EuropassCv model={model} photo={photo} />
    ) : (
      <ModernCv model={model} photo={photo} variant={format} />
    );
  return renderToBuffer(element);
}

export function cvFileName(format: CvFormat, locale: Locale): string {
  return `Stefan-Emanuel-Ciupitu-CV-${format}-${locale}.pdf`;
}
