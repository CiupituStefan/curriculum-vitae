import Link from "next/link";
import { headers } from "next/headers";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const value = (await headers()).get("x-locale");
  const locale = isLocale(value) ? value : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="font-display text-7xl text-accent">404</p>
        <h1 className="display mt-6 text-4xl">{dict.notFound.title}</h1>
        <p className="mt-4 text-muted">{dict.notFound.text}</p>
        <Link href={`/${locale}`} className="btn btn-primary mt-8">
          {dict.notFound.home}
        </Link>
      </div>
    </div>
  );
}
