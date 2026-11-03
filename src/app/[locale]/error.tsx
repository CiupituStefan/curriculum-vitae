"use client";

import { useParams } from "next/navigation";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/** Error boundary: shows a generic message only — no stack traces or internals reach visitors. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <h1 className="display text-4xl">{dict.error.title}</h1>
        <p className="mt-4 text-muted">{dict.error.text}</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-8">
          {dict.error.retry}
        </button>
      </div>
    </div>
  );
}
