import { THEME_SCRIPT } from "./theme";

/*
 * Runs before first paint to apply the saved/system theme (prevents a flash of the wrong theme)
 * and to mark the document as JS-enabled for progressive-enhancement styles. Allowed by the CSP
 * through the per-request nonce.
 */
export function ThemeScript({ nonce }: { nonce?: string }) {
  // eslint-disable-next-line react/no-danger -- static, developer-authored script; no user input.
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
