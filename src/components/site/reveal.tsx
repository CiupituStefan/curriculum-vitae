"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds `data-visible` to `[data-reveal]` elements as they scroll into view (CSS does the rest). */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.setAttribute("data-visible", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
