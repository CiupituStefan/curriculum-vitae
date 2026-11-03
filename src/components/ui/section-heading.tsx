import type { ReactNode } from "react";

export function SectionHeading({ id, eyebrow, title, action }: { id?: string; eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 id={id} className="display mt-2 text-3xl sm:text-4xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
