"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { applyStoredTheme } from "./theme";

/**
 * Re-applies the theme whenever the root layout is (re)mounted or the route changes. Without it,
 * switching language (/ro ↔ /en) replaces <html> and silently resets the page to the light theme.
 * useLayoutEffect runs before the browser paints, so there is no visible flash.
 */
export function ThemeSync() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    applyStoredTheme();
  }, [pathname]);
  return null;
}
