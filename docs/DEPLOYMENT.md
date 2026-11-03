# Deployment — Supabase, Vercel și domeniul `ciupitustefan.com`

> Starea actuală: codul este pe GitHub, iar CI rulează. **Nu am acces la contul tău Vercel, Supabase sau Google Cloud**, așa că pașii de mai jos
> trebuie făcuți de tine (durează ~30–45 de minute). Nimic din acest document nu modifică VM-ul Google Cloud.

## 1. Ordinea pașilor

1. Supabase: proiect, migrație, seed, cont de administrator (§2)
2. Vercel: import din GitHub, variabile de mediu, primul deploy (§3)
3. Domeniu: adăugare în Vercel, înregistrări DNS în Google Cloud, verificare HTTPS (§4)
4. Verificare finală (§5)

## 2. Supabase

1. <https://supabase.com/dashboard> → **New project**. Regiune: **Central EU (Frankfurt)** (date în UE, aproape de Vercel `fra1`).
   Parola bazei de date: generată și păstrată într-un manager de parole.
2. **SQL Editor** → rulează, în ordine, conținutul fișierelor:
   - `supabase/migrations/20261103000000_init.sql` (tabele, RLS, funcții, bucket-ul `portfolio`, politicile Storage)
   - `supabase/seed.sql` (conținutul CV-ului și cele 12 proiecte)

   Alternativ, cu Supabase CLI: `supabase link --project-ref <ref>`, apoi `supabase db push` și rularea `seed.sql` din SQL Editor.
3. **Authentication → Sign In / Providers → Email**: dezactivează **„Allow new users to sign up”** (contul de admin se creează manual).
   Recomandat: **Authentication → Multi-Factor** — activează TOTP.
4. **Authentication → Users → Add user → Create new user**: adresa ta de e-mail și o parolă puternică (≥ 16 caractere); bifează
   „Auto Confirm User”.
5. Acordă rolul de administrator (SQL Editor):

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'ciupitustefan12@gmail.com';
   ```

6. Verificare RLS pe proiectul real (SQL Editor):

   ```sql
   set role anon;
   select count(*) from public.projects;          -- 12 (doar cele publicate)
   select count(*) from public.contact_messages;  -- trebuie să dea EROARE: permission denied
   reset role;
   ```

7. **Project Settings → API Keys**: notează *Project URL*, cheia **publishable** și cheia **secret**.

## 3. Vercel

1. <https://vercel.com/new> → Import Git Repository → `CiupituStefan/curriculum-vitae`. Framework: Next.js (detectat automat).
2. **Settings → Environment Variables** (Production și Preview; valorile secrete doar „Sensitive”):

   | Variabilă | Valoare |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://ciupitustefan.com` (Production) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | cheia publishable |
   | `SUPABASE_SECRET_KEY` | cheia secret — **Sensitive** |
   | `IP_HASH_SALT` | `openssl rand -base64 48` — **Sensitive** |
   | `CRON_SECRET` | `openssl rand -base64 48` — **Sensitive** (Vercel Cron îl trimite automat) |
   | `CONTACT_RETENTION_DAYS` | `180` |
   | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | opțional, pentru notificări e-mail (domeniu verificat în Resend) |

3. **Settings → Git → Production Branch**: `main` (după ce îl creezi, vezi `CI-CD.md` §6).
4. **Settings → Deployment Protection**: păstrează Vercel Authentication pentru preview-uri; generează „Protection Bypass for Automation”
   și salvează-l în GitHub ca `VERCEL_AUTOMATION_BYPASS_SECRET`.
5. Deploy. `vercel.json` fixează regiunea `fra1` și cronul zilnic `/api/cron/retention` (03:17 UTC).

## 4. Domeniul (Google Cloud → Vercel)

1. Vercel → Project → **Settings → Domains** → adaugă `ciupitustefan.com` și `www.ciupitustefan.com`. Alege ca domeniu principal
   `ciupitustefan.com`, cu `www` redirecționat permanent (308) spre el (redirecționarea canonică).
2. Vercel afișează **exact** înregistrările necesare (de regulă un `A` pentru apex și un `CNAME` pentru `www`, cu valori specifice
   proiectului). **Folosește valorile afișate de Vercel; nu copia IP-uri din alte surse.**
3. Google Cloud Console → **Network services → Cloud DNS** → zona domeniului (dacă domeniul folosește Cloud DNS; altfel în
   **Cloud Domains → DNS** sau la furnizorul de nameserver afișat acolo):
   - **Înainte de orice modificare, exportă lista înregistrărilor existente** (sau fă o captură de ecran).
   - Nu șterge `MX`, `TXT` (SPF, DKIM, DMARC, verificări Google) sau alte înregistrări folosite de alte servicii.
   - Dacă există deja un `A` pe apex care indică spre VM, **nu îl șterge până nu confirmi că VM-ul nu servește nimic necesar**;
     înlocuiește-l cu valoarea Vercel doar când ești sigur.
   - Adaugă `A @ → <valoarea Vercel>` și `CNAME www → <valoarea Vercel>` (TTL 300 în timpul migrării).
   - Dacă există înregistrări `CAA`, adaugă `0 issue "letsencrypt.org"` (Vercel emite certificatele prin Let's Encrypt).
4. Așteaptă ca Vercel să arate „Valid Configuration”; certificatul TLS este emis automat.

## 5. Verificare finală (checklist)

```bash
dig +short ciupitustefan.com A
dig +short www.ciupitustefan.com CNAME
curl -sI http://ciupitustefan.com | head -3          # 308 → https
curl -sI https://www.ciupitustefan.com | head -3     # 308 → https://ciupitustefan.com
curl -sI https://ciupitustefan.com/ro | grep -iE "strict-transport|content-security|x-frame"
curl -s https://ciupitustefan.com/api/health          # {"status":"ok","database":"ok",…}
```

- [ ] <https://www.ssllabs.com/ssltest/> → nota A sau A+
- [ ] `/ro` și `/en` se încarcă; selectorul de limbă funcționează
- [ ] Cele 8 PDF-uri se descarcă (`/admin/documents` → Previzualizare)
- [ ] Login la `/admin/login`; editează o secțiune și verifică pe site; restaurează versiunea anterioară
- [ ] Creează un proiect draft, încarcă o imagine și un PDF, publică-l, apoi șterge-l
- [ ] Trimite un mesaj din formular și verifică-l în `/admin/messages` (și în e-mail, dacă Resend este configurat)
- [ ] Workflow-ul „Post-deploy checks” este verde (GitHub → Actions)
- [ ] Google Search Console: adaugă proprietatea și trimite `https://ciupitustefan.com/sitemap.xml`
