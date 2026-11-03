# Ghid de administrare

Panoul este la **`/admin`** (de exemplu `https://ciupiustefan.com/admin`). Nu există link public spre el, iar motoarele de căutare nu îl indexează.

## Autentificare

- Intră la `/admin/login` cu e-mailul și parola contului creat în Supabase (`DEPLOYMENT.md` §2).
- După 10 încercări greșite în 15 minute, autentificarea se blochează temporar.
- Ieșire: butonul **Deconectare** din meniul lateral.

## Conținutul CV-ului

Meniul **Conținut CV** are câte o pagină pentru fiecare dintre cele 13 secțiuni: profil, contact, experiență, educație, competențe tehnice,
competențe personale, limbi, certificări, cursuri, voluntariat, premii, alte informații, SEO.

- Fiecare câmp text are două casete, **RO** și **EN**. Completează-le pe amândouă (dacă una e goală, site-ul afișează cealaltă limbă).
- Elementele de listă se deschid cu un clic; săgețile le mută, iar coșul le șterge. **Adaugă** creează un element nou.
- **Salvează secțiunea** validează datele pe server. Dacă un câmp nu e valid (de ex. un link care nu începe cu `https://`, o dată în alt
  format decât `AAAA-LL`), primești lista câmpurilor de corectat și nu se salvează nimic.
- Modificările apar imediat pe site și în toate PDF-urile.
- **Istoric versiuni**: fiecare salvare creează o versiune; butonul **Restaurează** readuce o versiune anterioară.
- Experiențele se sortează automat după dată. Un câmp „Sfârșit” gol înseamnă „prezent”.
- Secțiunile goale (de exemplu „Premii”) nu apar pe site și nici în PDF.

### Date de contact și confidențialitate

- **Publică telefonul pe site** și **Include telefonul în CV-urile PDF** sunt dezactivate implicit. Activează-le doar dacă vrei ca numărul
  să fie public (PDF-urile se pot descărca de oricine).

## Proiecte (portofoliu)

- **Proiecte → Proiect nou**: completează slug-ul (adresa paginii, ex. `antena-rfid`), categoria, anul, titlul și rezumatul în ambele limbi.
  Câmpurile studiului de caz (obiectiv, problemă, rol, contribuție, proces, rezultate) sunt opționale; doar cele completate apar pe site.
- **Stare**: „Ciornă” nu este vizibilă public; „Publicat” apare în portofoliu, în CV și în PDF-uri.
- **Recomandat** pune proiectul pe pagina principală (se afișează primele 3, după „Ordine afișare”). Proiectele recomandate apar cu rezumat
  în PDF; celelalte apar doar cu titlul.
- **Imagini și fișiere** (după prima salvare): imagine principală, galerie (max. 24) și documente PDF (max. 12). Limită: 4 MB per fișier.
  Imaginile acceptate sunt JPEG, PNG, WebP și AVIF. Sunt convertite automat în WebP, iar metadatele (inclusiv locația GPS) sunt eliminate.
  PDF-urile care conțin scripturi sau acțiuni automate sunt respinse. Completează textul alternativ (RO/EN) pentru accesibilitate.
- **Șterge proiectul** elimină și toate fișierele lui (cere confirmare).

## Mesaje

**Mesaje** arată mesajele din formularul de contact. **Răspunde** deschide clientul de e-mail, iar **Șterge** elimină mesajul definitiv.
Mesajele mai vechi de 180 de zile se șterg automat (politica de retenție declarată în pagina de confidențialitate).

## CV-uri PDF

**CV-uri PDF** listează cele 8 variante (Modern, stil Europass, ATS, tipărire × RO/EN). PDF-urile se generează la fiecare descărcare din
conținutul curent, deci sunt mereu sincronizate: nu există un pas separat de regenerare. Folosește **Previzualizare** după orice modificare
importantă, ca să verifici paginarea.

## Bune practici

- Folosește o parolă unică și activează MFA în Supabase.
- Nu publica date personale ale altor persoane (ex. datele de contact ale referințelor) fără acordul lor.
- Nu inventa rezultate: completează „Rezultate” doar cu informații verificabile.
