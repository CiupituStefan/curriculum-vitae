import { ArrowUpRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { t } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMonth, isoMonth } from "@/lib/format";
import type { Experience } from "@/domain/content/schema";

type Props = { items: Experience[]; locale: Locale; dict: Dictionary["cv"]; compact?: boolean };

export function ExperienceTimeline({ items, locale, dict, compact = false }: Props) {
  return (
    <ol className="relative">
      {items.map((item, index) => {
        const ongoing = !item.end;
        return (
          <li key={item.id} className="relative grid gap-2 pb-10 pl-8 last:pb-0 md:grid-cols-[11rem_1fr] md:gap-8 md:pl-0" data-reveal>
            {index < items.length - 1 ? (
              <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-3 w-px bg-line md:left-[11.5rem]" />
            ) : null}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-2 size-[11px] rounded-full border-2 md:left-[calc(11.5rem-5px)] ${
                ongoing ? "border-accent bg-accent" : "border-line-strong bg-bg"
              }`}
            />
            <div className="text-sm text-muted md:pt-0.5 md:text-right md:pr-6">
              <p className="font-medium tabular-nums text-ink/80">
                <time dateTime={isoMonth(item.start)}>{formatMonth(item.start, locale)}</time>
                {" – "}
                {item.end ? <time dateTime={isoMonth(item.end)}>{formatMonth(item.end, locale)}</time> : dict.present}
              </p>
              <p className="mt-0.5 text-xs">{t(item.location, locale)}</p>
            </div>
            <div className="md:pl-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">{dict.kinds[item.kind]}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{t(item.role, locale)}</h3>
              <p className="text-sm text-muted">
                {item.organizationUrl ? (
                  <a href={item.organizationUrl} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-0.5 hover:text-ink">
                    {item.organization}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                ) : (
                  item.organization
                )}
              </p>
              {t(item.summary, locale) ? <p className="mt-3 leading-relaxed">{t(item.summary, locale)}</p> : null}
              {!compact && item.responsibilities.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">{dict.responsibilities}</h4>
                  <ul className="mt-2 space-y-1.5">
                    {item.responsibilities.map((entry, i) => (
                      <li key={i} className="relative pl-4 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-line-strong">
                        {t(entry, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {!compact && item.achievements.length > 0 ? (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">{dict.achievements}</h4>
                  <ul className="mt-2 space-y-1.5">
                    {item.achievements.map((entry, i) => (
                      <li key={i} className="relative pl-4 leading-relaxed before:absolute before:left-0 before:top-[0.7em] before:size-1.5 before:rounded-full before:bg-accent">
                        {t(entry, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {item.skills.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={dict.skillsUsed}>
                  {(compact ? item.skills.slice(0, 5) : item.skills).map((skill) => (
                    <li key={skill} className="chip">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
