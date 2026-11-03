import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { isLocale, t, DEFAULT_LOCALE } from "@/i18n/config";
import { getCvContent } from "@/server/services/content-service";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ștefan-Emanuel Ciupitu";

/** Open Graph card (LinkedIn, e-mail and chat previews), generated from the live profile. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const { content } = await getCvContent();
  const root = process.cwd();
  const [fraunces, inter, photo] = await Promise.all([
    readFile(path.join(root, "assets/fonts/Fraunces_400Regular.ttf")),
    readFile(path.join(root, "assets/fonts/Inter_400Regular.ttf")),
    readFile(path.join(root, "public/images/stefan-ciupitu-square.jpg")),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f8f7f4", padding: 72, alignItems: "center", gap: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontFamily: "Inter", fontSize: 24, letterSpacing: 4, color: "#9c4f25", textTransform: "uppercase" }}>
            {t(content.profile.location, locale)}
          </div>
          <div style={{ fontFamily: "Fraunces", fontSize: 84, lineHeight: 1.02, color: "#15161a", marginTop: 24 }}>
            {content.profile.fullName}
          </div>
          <div style={{ fontFamily: "Inter", fontSize: 32, color: "#565a62", marginTop: 28, lineHeight: 1.3 }}>
            {t(content.profile.headline, locale)}
          </div>
          <div style={{ display: "flex", marginTop: 40, width: 96, height: 4, background: "#9c4f25" }} />
        </div>
        <img src={photoSrc} width={360} height={360} alt="" style={{ borderRadius: 32, objectFit: "cover" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 400, style: "normal" },
      ],
    },
  );
}
