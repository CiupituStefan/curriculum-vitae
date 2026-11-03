# Operare și mentenanță

## 1. Monitorizare

| Ce | Unde |
|---|---|
| Disponibilitate | `GET /api/health` → 200 `{"status":"ok","database":"ok"}` sau 503 `degraded`. Recomandat: un monitor extern gratuit (UptimeRobot / Better Stack) la 5 minute, cu alertă pe e-mail. |
| Erori și loguri | Vercel → Project → **Logs** (JSON structurat: `level`, `event`, `context`). Evenimente utile: `contact.failed`, `admin.action_failed`, `cv.pdf_failed`, `auth.login_failed`, `content.section_invalid`. |
| Performanță reală | Vercel Speed Insights (opțional, gratuit pe Hobby) — necesită adăugarea pachetului și a domeniului în CSP (`connect-src`). |
| Securitate | GitHub → Security (CodeQL, Dependabot, Gitleaks); rezultatele ZAP în jobul `post-deploy`. |
| Baza de date | Supabase → Reports / Logs (Auth, Postgres, Storage). |

Logurile nu conțin parole, tokenuri, chei, e-mailuri, numere de telefon, IP-uri sau textul mesajelor (redactare automată în
`src/lib/logger.ts`). Nu loga niciodată obiecte `request` sau `formData` întregi.

## 2. Backup

| Date | Mecanism | Frecvență / retenție |
|---|---|---|
| Codul | GitHub (istoric complet) | la fiecare commit |
| Conținutul CV | Tabelul `cv_section_revisions` (ultimele 50 de versiuni per secțiune) + backup-urile Supabase | la fiecare salvare |
| Baza de date | Supabase Free: backup zilnic automat (retenție conform planului). **Recomandat**: export lunar manual | vezi mai jos |
| Fișiere (Storage) | Nu sunt incluse în backup-ul bazei de date → export manual | lunar / după modificări mari |

Export manual (cu Supabase CLI sau `pg_dump`; connection string din Project Settings → Database):

```bash
pg_dump "$SUPABASE_DB_URL" --schema=public --data-only --no-owner -f backup-$(date +%F).sql
supabase storage cp -r ss:///portfolio ./backup-portfolio --experimental   # sau descarcă din Dashboard → Storage
```

Păstrează exporturile criptate (ex. un arhivator cu parolă) și **nu** în repository (conțin date personale din mesaje).

## 3. Restaurare

- **O secțiune CV**: Admin → secțiunea → „Istoric versiuni” → **Restaurează** (restaurarea devine o versiune nouă, deci poate fi anulată).
- **Baza de date**: Supabase → Database → Backups → Restore (sau `psql "$SUPABASE_DB_URL" -f backup.sql` pe un proiect nou, după migrație).
- **Proiect nou de la zero**: rulează migrația, apoi backup-ul de date (sau `seed.sql`), recreează contul admin (`DEPLOYMENT.md` §2), încarcă din nou fișierele în bucket-ul `portfolio` cu aceleași căi.
- **Test de restaurare**: de cel puțin o dată pe an, restaurează un backup într-un proiect Supabase temporar și rulează `DATABASE_URL=… npm run test:db` pe o copie goală pentru verificarea schemei.

## 4. Rollback

| Situație | Acțiune |
|---|---|
| Deployment defect | Vercel → Deployments → deployment-ul anterior bun → **⋯ → Instant Rollback** (secunde, fără rebuild). CLI: `vercel rollback <url>` |
| Apoi, în cod | `git revert <sha>` → PR → CI verde → merge (altfel următorul deploy readuce bug-ul) |
| Conținut greșit | Restaurare din istoricul de versiuni (§3) |
| Migrație SQL greșită | Scrie o migrație nouă care o anulează (nu edita migrațiile deja aplicate); în caz grav, restaurare din backup |

## 5. Incidente

1. **Detectare**: alertă de monitorizare, eroare în loguri, raport extern.
2. **Limitare**: rollback (§4). Pentru compromitere suspectată: rotește imediat cheia secretă Supabase (Project Settings → API Keys →
   generează cheie nouă, actualizează Vercel, revocă vechea cheie), `IP_HASH_SALT`, `CRON_SECRET`, `RESEND_API_KEY`; schimbă parola
   adminului; Supabase → Auth → Users → Sign out user (revocă sesiunile).
3. **Analiză**: logurile Vercel și Supabase; `cv_section_revisions` (cine/când a modificat); `git log`.
4. **Remediere**: fix → PR → CI → deploy; test de regresie care reproduce problema.
5. **GDPR**: dacă au fost afectate date personale (mesajele de contact), evaluează notificarea ANSPDCP în **72 de ore**
   (art. 33 GDPR) și informarea persoanelor vizate dacă riscul este ridicat.
6. **Post-mortem** scurt în `docs/` (ce, de ce, ce am schimbat).

## 6. Actualizarea dependențelor

- Dependabot deschide PR-uri săptămânale (npm grupat minor/patch; GitHub Actions separat). CI-ul complet decide dacă se pot face merge.
- Actualizările majore (Next.js, React, Supabase, react-pdf): citește notele de versiune, rulează local toate suitele și verifică
  vizual PDF-urile (`PDF_OUT=./out-pdf npm run test:integration`).
- Lunar: `npm audit`, `npm outdated`.

## 7. Mașina virtuală Google Cloud

**Nu este folosită și nu a fost modificată.** Site-ul rulează integral pe Vercel + Supabase, deci VM-ul nu este necesar și nu trebuie să
găzduiască o copie a site-ului. Recomandări (decizia îți aparține):

- Dacă nu o folosești, oprește-o din consolă pentru a evita costuri (după ce verifici că nu servește nimic — vezi și DNS, `DEPLOYMENT.md` §4).
- Utilizări viitoare posibile, dacă apare o nevoie reală: scanare antivirus (ClamAV) pentru fișiere încărcate de terți; runner GitHub
  Actions self-hosted; un laborator demonstrativ de securitate (ex. FortiGate VM) prezentat ca proiect în portofoliu; backup-uri
  programate (`pg_dump` + export Storage) către Cloud Storage.

## 8. Calendar de mentenanță

| Frecvență | Sarcină |
|---|---|
| Săptămânal | PR-uri Dependabot; mesaje noi în `/admin/messages` |
| Lunar | Backup manual DB + Storage; `npm audit`; verificare loguri pentru erori |
| Trimestrial | Actualizare CV/portofoliu; verificare ZAP și SSL Labs; rotirea `CRON_SECRET` |
| Anual | Test de restaurare; revizuirea politicii de confidențialitate; reînnoirea domeniului în Google Cloud |
