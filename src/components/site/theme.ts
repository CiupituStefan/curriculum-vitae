/*
 * Single source of truth for theme resolution. Used by the pre-paint inline script (serialised
 * below) and by <ThemeSync>, which re-applies it after client navigations that replace <html>
 * (e.g. switching /ro ↔ /en swaps the root layout, dropping attributes set outside React).
 */
export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "theme";

export function applyStoredTheme(): void {
  const root = document.documentElement;
  root.classList.add("js");
  let theme: Theme = "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
  } catch {
    /* storage unavailable: keep light */
  }
  root.dataset.theme = theme;
}

/**
 * Inline, dependency-free equivalent of applyStoredTheme for the <head> script (runs before paint).
 * Kept as a literal string so minification cannot change it; tests/unit/theme.test.ts asserts that
 * both implementations produce the same result.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');var t='light';try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}catch(e){}d.dataset.theme=t;})();`;
