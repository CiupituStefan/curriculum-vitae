import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/** Extracts the text layer of a PDF, proving the text is real and selectable (not an image). */
export async function extractPdf(buffer: Buffer): Promise<{ pages: number; text: string }> {
  const doc = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: false }).promise;
  let text = "";
  for (let index = 1; index <= doc.numPages; index++) {
    const page = await doc.getPage(index);
    const content = await page.getTextContent();
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }
  return { pages: doc.numPages, text };
}
