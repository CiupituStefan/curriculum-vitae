# ciupiustefan.com — CV online, portofoliu și panou de administrare

Site personal profesional al lui **Ștefan-Emanuel Ciupitu**: CV interactiv bilingv (RO/EN), portofoliu cu studii de caz,
generare reală de CV-uri PDF (Modern, stil Europass, ATS, tipărire) și un panou de administrare protejat.

| | |
|---|---|
| Stack | Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 |
| Date / Auth / Fișiere | Supabase (PostgreSQL + RLS, Auth, Storage) |
| PDF | `@react-pdf/renderer` (text selectabil, fonturi încorporate cu diacritice) |
| Testare | Vitest (unit + integrare) · teste SQL pentru RLS · Playwright (E2E, desktop + mobil, axe WCAG) |
| CI/CD | GitHub Actions (CI, securitate, verificări post-deploy) · Vercel (integrare Git nativă) |

## Pornire rapidă

```bash
nvm use            # Node 22
npm ci
cp .env.example .env.local   # opțional: fără Supabase, site-ul rulează în mod read-only din datele seed
npm run dev        # http://localhost:3000
```

Fără variabilele Supabase, site-ul public funcționează complet (conținutul vine din `src/domain/**/seed.ts`), PDF-urile se generează,
iar zona de administrare și formularul de contact sunt **blocate** (fail secure) cu un mesaj explicit.

## Comenzi

| Comandă | Ce face |
|---|---|
| `npm run lint` | ESLint (reguli Next.js, Core Web Vitals, TypeScript, a11y) |
| `npm run typecheck` | Generează tipurile de rute și rulează `tsc --noEmit` |
| `npm run test:unit` / `test:integration` | Vitest |
| `npm run test:db` | Aplică migrațiile pe un PostgreSQL temporar și rulează testele RLS |
| `npm run build && npm run test:e2e` | Build de producție + Playwright |
| `npm run db:seed:generate` | Regenerează `supabase/seed.sql` din conținutul tipizat |

## Structură

```
src/
  app/                  Rute (App Router): [locale]/… site public, admin/… panou, api/… route handlers
  components/           UI: site/, cv/, portfolio/, admin/, ui/, icons/
  domain/               Modele + validare Zod (conținut CV, proiecte, contact) și datele seed
  i18n/                 Configurare limbi, dicționare RO/EN, politica de confidențialitate
  lib/                  Utilitare fără stare: env public, erori, logger, format, SEO, securitate
  server/               Doar server: clienți Supabase, auth, repository-uri (acces date), servicii (logică)
  pdf/                  Model de document + 4 șabloane PDF + randare
  proxy.ts              Rutare limbă, CSP cu nonce, reîmprospătare sesiune, poartă /admin
supabase/               Migrații SQL, seed, teste RLS
tests/ e2e/             Vitest și Playwright
docs/                   Documentația proiectului (vezi mai jos)
.github/workflows/      CI, Security, Post-deploy
```

## Documentație

| Document | Conținut |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Justificarea stack-ului, straturi, diagrame (componente, flux de date, bază de date) |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model (STRIDE) și raportul de audit de securitate |
| [docs/TESTING.md](docs/TESTING.md) | Strategia și raportul de testare (rezultate reale) |
| [docs/CI-CD.md](docs/CI-CD.md) | Workflow-uri, diagramă CI/CD, secrete, branch protection |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Supabase, Vercel, DNS pentru `ciupiustefan.com`, variabile de mediu |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Monitorizare, backup, restaurare, rollback, incidente, mentenanță, VM Google Cloud |
| [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) | Ghidul de administrare a conținutului |
| [docs/GDPR.md](docs/GDPR.md) | Inventarul prelucrărilor și măsurile de protecție a datelor |
| [docs/CONTENT-REVIEW.md](docs/CONTENT-REVIEW.md) | Neconcordanțe găsite în CV-uri, care trebuie confirmate |
