import path from "node:path";
import { Font } from "@react-pdf/renderer";

/*
 * Embedded TrueType fonts (SIL OFL). The standard PDF fonts (Helvetica…) use WinAnsi encoding,
 * which cannot represent Romanian ș/ț — embedding full-coverage fonts guarantees correct glyphs.
 * react-pdf subsets the fonts, so only the glyphs actually used end up in each document.
 */
let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  const dir = path.join(process.cwd(), "assets", "fonts");
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(dir, "Inter_400Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "Inter_400Regular_Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(dir, "Inter_600SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(dir, "Inter_700Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Fraunces",
    fonts: [
      { src: path.join(dir, "Fraunces_400Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "Fraunces_400Regular_Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
      { src: path.join(dir, "Fraunces_600SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  // Never hyphenate: avoids broken words such as "secu-ritate" and keeps text ATS-friendly.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
