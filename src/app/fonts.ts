import { Fraunces, Inter } from "next/font/google";

/* Self-hosted at build time by next/font (no runtime request to Google, no layout shift). */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});
