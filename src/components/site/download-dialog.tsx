"use client";

import { Download, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { LOCALES, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { CV_FORMATS, type CvFormat } from "@/pdf/formats";

type Props = {
  locale: Locale;
  labels: Dictionary["download"];
  trigger: { className: string; children: ReactNode; label?: string };
};

const LANGUAGE_NAMES: Record<Locale, string> = { ro: "Română", en: "English" };

/** CV download picker: language × format. Downloads a PDF generated on the server. */
export function DownloadCvDialog({ locale, labels, trigger }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [language, setLanguage] = useState<Locale>(locale);
  const [format, setFormat] = useState<CvFormat>("modern");
  const titleId = useId();
  const descriptionId = useId();
  // Unique radio-group names: several dialogs can exist on one page (header, hero, mobile menu).
  const groupId = useId();
  const href = `/api/cv/${language}/${format}`;

  return (
    <>
      <button
        type="button"
        className={trigger.className}
        aria-haspopup="dialog"
        aria-label={trigger.label}
        onClick={() => dialogRef.current?.showModal()}
      >
        {trigger.children}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface p-0 shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="display text-2xl">
                {labels.title}
              </h2>
              <p id={descriptionId} className="mt-2 text-sm text-muted">
                {labels.description}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost size-10 min-h-0 shrink-0 rounded-full p-0"
              aria-label={labels.close}
              onClick={() => dialogRef.current?.close()}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">{labels.language}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {LOCALES.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                >
                  <input
                    type="radio"
                    name={`${groupId}-language`}
                    value={value}
                    checked={language === value}
                    onChange={() => setLanguage(value)}
                    className="accent-[var(--accent)]"
                  />
                  {LANGUAGE_NAMES[value]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">{labels.format}</legend>
            <div className="mt-2 grid gap-2">
              {CV_FORMATS.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                >
                  <input
                    type="radio"
                    name={`${groupId}-format`}
                    value={value}
                    checked={format === value}
                    onChange={() => setFormat(value)}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{labels.formats[value].label}</span>
                    <span className="block text-sm text-muted">{labels.formats[value].description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {format === "europass" ? <p className="mt-4 text-xs text-muted">{labels.europassNote}</p> : null}

          <a href={href} download className="btn btn-primary mt-6 w-full" data-testid="cv-download-link">
            <Download size={18} aria-hidden="true" />
            {labels.action}
          </a>
        </div>
      </dialog>
    </>
  );
}
