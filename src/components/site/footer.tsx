import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Contact } from "@/domain/content/schema";
import { SocialLinks } from "./social-links";

type Props = { locale: Locale; name: string; contact: Contact; dict: Dictionary };

export function SiteFooter({ locale, name, contact, dict }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg">{name}</p>
          <p className="mt-1 text-sm text-muted">
            © {year} {name}. {dict.footer.rights}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SocialLinks contact={contact} />
          <Link href={`/${locale}/privacy`} className="link-underline text-sm text-muted hover:text-ink">
            {dict.footer.privacy}
          </Link>
          <Link href={`/${locale}/cookies`} className="link-underline text-sm text-muted hover:text-ink">
            {dict.footer.cookies}
          </Link>
          <a href="#main" className="link-underline text-sm text-muted hover:text-ink">
            {dict.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
