# Protecția datelor (GDPR)

> Acesta este un inventar tehnic, făcut cu bună-credință, al prelucrărilor efectuate de aplicație. **Nu este o evaluare juridică
> certificată.** Pagina publică `/{ro|en}/privacy` (`src/i18n/privacy.ts`) trebuie actualizată la fiecare schimbare de funcționalitate.

## Registrul prelucrărilor

| Prelucrare | Date | Scop | Temei | Retenție | Destinatari |
|---|---|---|---|---|---|
| Formular de contact | nume, e-mail, subiect, mesaj, limba | răspuns la mesaj | consimțământ (6(1)(a)) + demersuri precontractuale (6(1)(b)) | 180 zile, ștergere automată (`purge_expired_data`, cron zilnic) | Supabase (DB), Resend (dacă e activat), Vercel (procesare) |
| Limitarea abuzurilor | HMAC-SHA-256(IP, salt secret), contor | securitate | interes legitim (6(1)(f)) | ≤ 24 h (șters de același job) | Supabase |
| Autentificare admin | e-mail, parolă hash (Supabase Auth), cookie-uri de sesiune | acces la panou | interes legitim / executare | cât timp există contul | Supabase |
| Preferințe | cookie `NEXT_LOCALE`, `localStorage.theme` | limba și tema | strict necesare (exceptate de la consimțământ, art. 5(3) ePrivacy) | 1 an / până la ștergere | doar browserul |
| Jurnale de găzduire | IP, URL, user-agent | operare, securitate | interes legitim | conform Vercel | Vercel |
| Datele proprietarului | CV-ul publicat | prezentare profesională | decizia proprietarului | până la modificare | public |

## Măsuri

- **Minimizare**: fără analytics și fără cookie-uri de tracking; formularul cere doar nume, e-mail și mesaj. Telefonul proprietarului este
  ascuns implicit. Data nașterii, locul nașterii, genul, WhatsApp și datele de contact ale referințelor din CV-urile originale **nu** au
  fost publicate.
- **Limitarea scopului**: mesajele sunt folosite doar pentru răspuns; nu există newsletter.
- **Transparență**: politica de confidențialitate, legată din formular, cu bifă obligatorie.
- **Securitate** (art. 32): vezi `SECURITY.md` — RLS, criptare în tranzit (HTTPS/HSTS) și la repaus (Supabase), acces doar pentru admin.
- **Ștergere sigură**: ștergere din panou (mesaj cu mesaj) și automată la 180 de zile; la ștergerea unui proiect se șterg și fișierele.
- **Imagini**: metadatele EXIF/GPS sunt eliminate la încărcare.
- **Transferuri**: Vercel și Resend sunt furnizori din SUA (SCC / Data Privacy Framework); baza de date Supabase este găzduită în SUA (East US — North Virginia), tot pe baza acestor garanții. Dacă preferi ca datele să rămână în UE, mută proiectul Supabase în Frankfurt și setează `regions: ["fra1"]` în `vercel.json`.
  Semnează DPA-urile disponibile în conturile Vercel, Supabase și Resend.

## Drepturile persoanelor vizate — procedură

1. Cererea vine pe e-mail. Verifică identitatea (răspuns de pe aceeași adresă).
2. Acces/portabilitate: exportă rândurile din `contact_messages` cu acel e-mail (SQL Editor) și trimite-le.
3. Ștergere: șterge din `/admin/messages` (sau `delete from contact_messages where email = …`).
4. Răspuns în cel mult o lună.
