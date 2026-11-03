# Verificarea conținutului — de confirmat de proprietar

Conținutul a fost preluat **exclusiv** din cele trei documente furnizate (CV FlowCV din 05.10.2026, CV Europass lung, CV Europass scurt).
Nimic nu a fost inventat. Punctele de mai jos sunt neconcordanțe sau decizii care trebuie confirmate; toate pot fi corectate din panou.

## Neconcordanțe între documente (am folosit varianta Europass lungă, cu date exacte)

| # | Element | FlowCV | Europass | Folosit pe site |
|---|---|---|---|---|
| 1 | Daily Caffe — perioada | 07/2025 – **prezent** | 22.07.2025 – **22.10.2025** | iul. 2025 – oct. 2025 |
| 2 | Asistent de cercetare AUMOVIO × USV | 01/2026 – **07/2026** | 06.01.2026 – **30.06.2026** | ian. 2026 – iun. 2026 |
| 3 | Lucrare de diplomă | **06/2021** – 07/2025 | 01.06.2025 – 31.07.2025 | iun. 2025 – iul. 2025 |
| 4 | Practică USV securitate | — | 03.10.2025 – 06.02.2026 (lung) / 01.10.2025 – 01.03.2026 (scurt) | oct. 2025 – feb. 2026, separat de practica Fortinet (feb. – mai 2026) |
| 5 | Organizația de voluntariat | „FIRESC” (link spre fiesc.usv.ro) | — | „FIESC – USV” — confirmă denumirea exactă |
| 6 | Cele „6 cursuri, 176 de ore” | — | sunt numite doar 4: Cyber Threat Management, Endpoint Security, Network Defense, Ethical Hacking | am listat doar cele 4 numite, fără emitent (nu este precizat în CV) |

## Informații omise intenționat

- **DPPD Nivel II**: în CV-ul Europass lung, descrierea conține un text despre panificație („fabricarea de pâine…”) care pare copiat
  dintr-un alt document. Nu l-am publicat; secțiunea apare fără descriere.
- **Date personale**: data și locul nașterii, genul, WhatsApp — nu sunt necesare unui CV online public.
- **Telefon**: ascuns implicit pe site și în PDF (îl poți activa din Admin → Date de contact).
- **Referințe** (Coca Eugen, Adrian-Ioan Petrariu, Alexandru Lavric): datele lor de contact sunt date personale ale unor terți; am pus
  „Referințe disponibile la cerere”. Le poți publica doar cu acordul lor.
- **Premii**: CV-urile nu conțin premii; secțiunea există în panou, dar e goală, deci nu apare pe site.

## Texte redactate de mine (pe baza faptelor din CV) — revizuiește-le

- Mesajul de valoare „Ce aduc într-o echipă” (`profile.valueProposition`).
- Textul de invitație de pe pagina principală („Sunt deschis la discuții despre roluri în inginerie electronică, hardware și securitate
  cibernetică”) — se află în `src/i18n/dictionaries.ts` (`home.ctaText`).
- Traducerile în engleză ale întregului conținut.
- Maparea nivelurilor de competență: Proficient → „Avansat”, Competent → „Competent”, Amateur → „Noțiuni de bază / Foundational”.
- Categoriile și titlurile proiectelor (de ex. „Ceasuri de mașină” → „Ceasuri de bord pentru mașină / Car instrument cluster”).
- Grupurile de certificări: cele 16 cursuri Fortinet au emitentul „Fortinet” (deductibil din denumiri); ECDL, Certificatul Digital de
  Competență și Certificatul de Competență Profesională nu au emitent sau dată în CV — completează-le dacă vrei.

## Materiale lipsă care ar întări portofoliul

- Fotografii sau capturi ale proiectelor (PCB-uri, tastatura BLE, antena RFID, gmv.design) — acum se folosesc coperte tipografice.
- Linkuri GitHub pentru proiecte (firmware ZMK, scripturi), documentații PDF și rezultate măsurabile (de ex. consum, câștigul antenei).
- Datele obținerii certificărilor și linkurile de verificare (de ex. Credly sau Fortinet NSE).
