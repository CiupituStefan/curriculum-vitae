import "../globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { LOCALES, isLocale, t } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { siteUrl } from "@/lib/env";
import { getCvContent } from "@/server/services/content-service";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ThemeScript } from "@/components/site/theme-script";
import { ThemeSync } from "@/components/site/theme-sync";
import { RevealObserver } from "@/components/site/reveal";
import { fraunces, inter } from "../fonts";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e10" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { content } = await getCvContent();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t(content.seo.title, locale), template: `%s · ${content.profile.fullName}` },
    description: t(content.seo.description, locale),
    applicationName: content.profile.fullName,
    authors: [{ name: content.profile.fullName, url: siteUrl }],
    creator: content.profile.fullName,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const dict = getDictionary(locale);
  const { content } = await getCvContent();

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader locale={locale} name={content.profile.fullName} nav={dict.nav} download={dict.download} />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter locale={locale} name={content.profile.fullName} contact={content.contact} dict={dict} />
        <RevealObserver />
        <ThemeSync />
      </body>
    </html>
  );
}
