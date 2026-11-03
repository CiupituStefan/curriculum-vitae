import { describe, expect, it } from "vitest";
import { writeFile, mkdir } from "node:fs/promises";
import { seedContent } from "@/domain/content/seed";
import { seedProjects } from "@/domain/projects/seed";
import { CV_FORMATS, renderCvPdf } from "@/pdf/render";
import { LOCALES } from "@/i18n/config";
import { extractPdf } from "../support/pdf-text";

const normalize = (value: string) => value.replace(/\s+/g, " ");

describe("CV PDF generation", () => {
  for (const locale of LOCALES) {
    for (const format of CV_FORMATS) {
      it(`renders a valid ${format} PDF in ${locale} with selectable, complete text`, async () => {
        const buffer = await renderCvPdf(format, locale, seedContent, seedProjects, "https://ciupiustefan.com");
        expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
        if (process.env.PDF_OUT) {
          await mkdir(process.env.PDF_OUT, { recursive: true });
          await writeFile(`${process.env.PDF_OUT}/cv-${format}-${locale}.pdf`, buffer);
        }
        const { pages, text } = await extractPdf(buffer);
        const flat = normalize(text);
        expect(pages).toBeGreaterThanOrEqual(1);
        expect(pages).toBeLessThanOrEqual(6);
        // Romanian diacritics must survive as real characters.
        expect(flat).toContain("Ștefan-Emanuel Ciupitu");
        expect(flat).toContain("AUMOVIO");
        expect(flat).toContain("Daily Caffe");
        expect(flat).toContain("FortiGate 7.4 Administrator");
        expect(flat).toContain(seedContent.contact.email);
        // Phone is hidden by default (privacy) and must not leak into the document.
        expect(flat).not.toContain("773");
        if (locale === "ro") expect(flat).toContain("Securitate");
        else expect(flat).toContain("Cybersecurity");
        if (format === "europass") expect(flat).toMatch(/Europass/);
      });
    }
  }
});
