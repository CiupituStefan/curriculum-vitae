# Testare și QA — strategie și raport

> Rezultatele de mai jos provin din rulări reale, făcute pe 3 noiembrie 2026 în mediul de dezvoltare (Linux, Node 22, PostgreSQL 16,
> Chromium 1243 / Playwright 1.63). În CI se rulează aceleași suite (vezi `CI-CD.md`).

## 1. Piramida de teste

| Nivel | Instrument | Locație | Ce acoperă |
|---|---|---|---|
| Unit | Vitest | `tests/unit` | Validare (Zod, URL-uri sigure), seed-ul CV (toate secțiunile, paritate RO/EN), reguli anti-spam, i18n (negociere limbă, chei identice în dicționare), formatare date, upload (magic bytes, PDF activ, nume fișiere), open redirect, CSP, pseudonimizare IP, redactarea logurilor |
| Integrare | Vitest | `tests/integration` | Generarea celor 8 PDF-uri + extragerea textului (pdf.js) — text selectabil, diacritice, conținut complet, telefon absent; servicii: contact (validare, honeypot, „prea rapid”, rate limit), autorizare (anonim 401, non-admin 403, validare admin); Route Handlers `/api/cv` și `/api/health` |
| Bază de date / RLS | psql + PostgreSQL 16 | `supabase/tests` | Migrația + seed aplicate pe un server real; 37 de aserțiuni pentru anon / authenticated / admin / service_role |
| End-to-end | Playwright + axe-core | `e2e` | Desktop (1366×900) și mobil (Pixel 7): pagini, navigare, selector de limbă, CV, filtre portofoliu, studiu de caz, descărcare PDF, formular de contact, protecția admin, antete de securitate, SEO, temă, meniu mobil, overflow orizontal, erori în consolă, accesibilitate WCAG 2.2 AA |
| Performanță | Lighthouse 12 | manual | Performanță, accesibilitate, best practices, SEO |

## 2. Rezultate

| Suită | Comandă | Rezultat |
|---|---|---|
| ESLint | `npm run lint` | 0 erori, 0 avertismente |
| TypeScript | `npm run typecheck` | 0 erori |
| Unit | `npm run test:unit` | **50 / 50 trecute** |
| Integrare | `npm run test:integration` | **24 / 24 trecute** (8 PDF-uri RO/EN × 4 formate, 1–5 pagini fiecare) |
| RLS | `npm run test:db` | **37 / 37 aserțiuni trecute** |
| E2E | `npm run build && npm run test:e2e` | **73 trecute, 1 omis** (testul de meniu mobil rulează doar în proiectul `mobile`) |
| `npm audit --omit=dev` | | 0 vulnerabilități |

### Probleme găsite de teste și remediate

1. Formularul de contact afișa „Mesaj trimis” fără backend și ar fi pierdut mesaje reale → remediat (vezi `SECURITY.md` F2).
2. Dialogurile de descărcare din aceeași pagină își împărțeau grupurile radio → limba/formatul nu se puteau schimba → remediat.
3. axe: `label-content-name-mismatch` pe logo și pe selectorul de limbă → remediat.
4. Politica Storage pentru SELECT lipsea → remediat.
5. Bulinele din PDF puteau rămâne singure la final de pagină → `wrap={false}`.
6. Lighthouse: paragraful LCP din Hero era ascuns de animația de apariție până la hidratare → animația a fost eliminată deasupra fold-ului.

## 3. Accesibilitate (WCAG 2.2 AA)

- axe-core (reguli `wcag2a`, `wcag2aa`, `wcag21a/aa`, `wcag22aa`) pe 8 pagini × 2 viewport-uri: **0 încălcări serioase sau critice**.
- Lighthouse Accessibility: **100** pe toate paginile auditate.
- Implementat: link „Sari la conținut”, focus vizibil, ierarhie corectă de titluri, etichete vizibile pe toate câmpurile, erori legate prin
  `aria-describedby` și focus pe primul câmp invalid, `aria-current` în navigare, dialoguri native `<dialog>` (focus trap, Esc),
  contrast ≥ 4,5:1 în ambele teme, `prefers-reduced-motion` respectat, ținte tactile ≥ 40–44 px.
- Neefectuat: test manual cu cititor de ecran (NVDA / VoiceOver). Recomandat înainte de lansare.

## 4. Performanță (Lighthouse 12, preset mobil, throttling simulat, server local `next start`)

| Pagină | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| `/ro` | 88 | 100 | 100 | 100 | 0,9 s | 4,0 s | 0 | 60 ms |
| `/en/portfolio/ble-wireless-keyboard` | 93 | 100 | 100 | 100 | 0,8 s | 3,2 s | 0 | 60 ms |
| `/ro/contact` | 89 | 100 | 100 | 100 | 0,8 s | 3,7 s | 0 | 80 ms |
| `/ro/cv` | 87 | 100 | 100 | 100 | — | 3,9 s | 0 | 130 ms |

Interpretare onestă: valorile sunt de laborator, într-un container fără CDN și cu CPU limitat, sub throttling simulat de „slow 4G”.
LCP (~3–4 s) este dominat de „render delay” în simulare; CLS este 0 peste tot. Valorile reale (field data) trebuie urmărite după lansare
cu Vercel Speed Insights sau PageSpeed Insights pe `https://ciupitustefan.com`. Optimizări existente: Server Components (puțin JS),
fonturi self-hosted cu fallback ajustat, `next/image` AVIF/WebP, portret cu placeholder blur și `fetchPriority="high"`.

## 5. Ce nu a putut fi testat aici (și cum se testează)

| Neacoperit | Motiv | Cum |
|---|---|---|
| Login real, CRUD admin, upload în Storage | Nu există încă un proiect Supabase | După configurare: checklist manual din `DEPLOYMENT.md` §5 |
| Trimiterea reală a e-mailului | Fără cheie Resend | Trimite un mesaj de test după configurare |
| TLS, DNS, redirecționarea www | Domeniul nu este conectat | `DEPLOYMENT.md` §4 |
| ZAP baseline | Necesită URL public | Rulează automat în `post-deploy.yml` |

## 6. Rulare locală

```bash
npm run lint && npm run typecheck
npm run test:unit && npm run test:integration
npm run test:db                     # necesită binarele PostgreSQL sau DATABASE_URL
npm run build && npm run test:e2e   # necesită Chromium: npx playwright install chromium
PDF_OUT=./out-pdf npm run test:integration   # salvează cele 8 PDF-uri pentru inspecție vizuală
```
