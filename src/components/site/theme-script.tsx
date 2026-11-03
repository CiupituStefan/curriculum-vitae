/*
 * Runs before first paint to apply the saved/system theme (prevents a flash of the wrong theme)
 * and to mark the document as JS-enabled for progressive-enhancement styles. Allowed by the CSP
 * through the per-request nonce.
 */
const SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('theme');var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.dataset.theme=t;}catch(e){d.dataset.theme='light';}})();`;

export function ThemeScript({ nonce }: { nonce?: string }) {
  // eslint-disable-next-line react/no-danger -- static, developer-authored script; no user input.
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
