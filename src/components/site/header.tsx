"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { DownloadCvDialog } from "./download-dialog";
import { ThemeToggle } from "./theme-toggle";

type Props = { locale: Locale; name: string; nav: Dictionary["nav"]; download: Dictionary["download"] };

export function SiteHeader({ locale, name, nav, download }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: `/${locale}`, label: nav.home, exact: true },
    { href: `/${locale}/cv`, label: nav.cv },
    { href: `/${locale}/portfolio`, label: nav.portfolio },
    { href: `/${locale}/contact`, label: nav.contact },
  ];
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const otherLocale: Locale = locale === "ro" ? "en" : "ro";
  const switchHref = pathname.replace(/^\/(ro|en)(?=\/|$)/, `/${otherLocale}`);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent bg-bg/0"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        {nav.skipToContent}
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="group flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-ink font-display text-sm text-bg transition-colors group-hover:bg-accent"
          >
            ȘC
          </span>
          <span className="sr-only text-sm font-semibold tracking-tight sm:not-sr-only">{name}</span>
        </Link>

        <nav aria-label={nav.mainNavigation} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                  className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={switchHref}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="btn btn-ghost min-h-0 h-11 px-3 text-xs font-semibold tracking-wider"
            data-testid="language-switch"
            onClick={() => {
              // Remember the explicit choice (strictly necessary preference cookie, 1 year).
              document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
            }}
          >
            <span className="sr-only">{nav.switchToLanguage} {otherLocale === "en" ? "English" : "română"}: </span>
            <span className={locale === "ro" ? "text-ink" : ""}>RO</span>
            <span aria-hidden="true" className="text-line-strong">|</span>
            <span className={locale === "en" ? "text-ink" : ""}>EN</span>
          </Link>
          <ThemeToggle labels={{ light: nav.themeLight, dark: nav.themeDark }} />
          <div className="hidden sm:block">
            <DownloadCvDialog
              locale={locale}
              labels={download}
              trigger={{
                className: "btn btn-primary ml-1 min-h-0 h-10 px-4 text-sm",
                children: (
                  <>
                    <Download size={16} aria-hidden="true" />
                    {nav.downloadCv}
                  </>
                ),
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost size-11 min-h-0 rounded-full p-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav id="mobile-menu" aria-label={nav.mainNavigation} hidden={!open} className="border-t border-line md:hidden">
        <ul className="container-page grid gap-1 py-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href, link.exact) ? "page" : undefined}
                className="block rounded-xl px-4 py-3 text-base aria-[current=page]:bg-surface-2 aria-[current=page]:font-semibold"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2 sm:hidden">
            <DownloadCvDialog
              locale={locale}
              labels={download}
              trigger={{
                className: "btn btn-primary w-full",
                children: (
                  <>
                    <Download size={16} aria-hidden="true" />
                    {nav.downloadCv}
                  </>
                ),
              }}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}
