"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryImage = { src: string; alt: string; width: number; height: number };
type Labels = { open: string; close: string; previous: string; next: string };

/** Image grid with an accessible lightbox (native <dialog>: focus trap, Esc to close). */
export function Gallery({ images, labels }: { images: GalleryImage[]; labels: Labels }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const current = images[index];

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = useCallback((delta: number) => setIndex((i) => (i + delta + images.length) % images.length), [images.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (!dialog.open) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, i) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2"
              aria-label={`${labels.open}: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialogRef}
        aria-label={current?.alt}
        className="m-auto max-h-[92dvh] w-[min(72rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-line bg-surface p-0"
        onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}
      >
        {current ? (
          <figure className="relative">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="90vw"
              className="max-h-[80dvh] w-full object-contain"
            />
            <figcaption className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-sm text-muted">
              <span>{current.alt}</span>
              <span className="tabular-nums">
                {index + 1} / {images.length}
              </span>
            </figcaption>
            <div className="absolute right-3 top-3 flex gap-2">
              {images.length > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} className="btn btn-secondary size-10 min-h-0 bg-surface p-0" aria-label={labels.previous}>
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => step(1)} className="btn btn-secondary size-10 min-h-0 bg-surface p-0" aria-label={labels.next}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => dialogRef.current?.close()} className="btn btn-secondary size-10 min-h-0 bg-surface p-0" aria-label={labels.close}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}
