import "../globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { ThemeScript } from "@/components/site/theme-script";
import { fraunces, inter } from "../fonts";

export const metadata: Metadata = {
  title: { default: "Administrare", template: "%s · Administrare" },
  robots: { index: false, follow: false, nocache: true },
};

/** Root layout for the private administration area (separate from the public site). */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="ro" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body className="min-h-dvh bg-bg">{children}</body>
    </html>
  );
}
