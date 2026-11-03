import type { Locale } from "./config";

/*
 * Privacy and cookie policy texts. They describe only the processing this application actually
 * performs (verified in the 2026-11 audit: no analytics, no advertising, no third-party scripts).
 * Keep them in sync with the code when features change (see docs/GDPR.md). They are a good-faith
 * transparency notice, not a certified legal assessment.
 */
export type PrivacySection = { title: string; paragraphs: string[] };

/** Date shown on the policy pages. */
export const PRIVACY_UPDATED = "2026-11-03";
/** Version identifier stored with every contact-form consent (bump on any material change). */
export const PRIVACY_VERSION = "2026-11-03.2";

type Policy = { intro: string; sections: PrivacySection[] };

export function privacyPolicy(locale: Locale, email: string, retentionDays: number): Policy {
  if (locale === "en") {
    return {
      intro:
        "This notice explains which personal data this website processes, why, for how long and what your rights are. The site is designed to collect as little data as possible: it uses no analytics, advertising or tracking.",
      sections: [
        {
          title: "Who is responsible",
          paragraphs: [
            `The controller is Ștefan-Emanuel Ciupitu, a private individual based in Suceava, Romania, reachable at ${email}. This is a personal, non-commercial website: nothing is sold and no accounts can be created by visitors.`,
          ],
        },
        {
          title: "Contact form",
          paragraphs: [
            "When you send a message, I process your name, email address, the optional subject and the message itself, solely to read and answer it. No other fields are required.",
            "Legal basis: your consent (Art. 6(1)(a) GDPR), given by ticking the box, and steps taken at your request before a possible contract (Art. 6(1)(b) GDPR). To be able to demonstrate consent, the date and time it was given and the version of this policy shown to you are stored with the message. You can withdraw consent at any time by emailing me.",
            `Messages are stored in a database and automatically deleted after ${retentionDays} days, or earlier on request. A notification copy is sent to my mailbox; replies continue by email.`,
          ],
        },
        {
          title: "Security and abuse prevention",
          paragraphs: [
            "To protect the contact form and the administration area against spam and brute-force attacks, your IP address (and, for login attempts, the email address entered) is converted on the server into a non-reversible keyed hash (HMAC-SHA-256). Only that hash is stored, for at most 24 hours, in a rate-limiting counter. The raw IP address is not stored by this application.",
            "Legal basis: legitimate interest in keeping the service secure (Art. 6(1)(f) GDPR).",
            "The hosting provider may keep technical access logs (for example IP address and requested URL) for a short period, under its own policy.",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "No analytics, advertising or tracking cookies are used, and no third-party scripts, fonts or embeds are loaded. Only strictly necessary storage is used, which is exempt from consent; the details are in the cookie policy.",
          ],
        },
        {
          title: "Service providers (processors) and international transfers",
          paragraphs: [
            "Vercel Inc. (website hosting; functions run in the United States, Washington D.C. region), Supabase Inc. (database and file storage, hosted in the United States, North Virginia region) and Resend (sending notification emails from its EU region, Ireland). These providers act on my behalf under their data processing agreements. Because Vercel and Supabase are U.S. companies and data is stored in the U.S., transfers rely on the EU–U.S. Data Privacy Framework where the provider is certified, and otherwise on the EU Standard Contractual Clauses included in their agreements.",
          ],
        },
        {
          title: "Your rights and how to exercise them",
          paragraphs: [
            "You have the right of access, rectification, erasure, restriction of processing, data portability and objection, and the right to withdraw consent at any time.",
            `To exercise them, email ${email} from the address you used in the form (this is how your identity is verified). I will search for all data linked to that address, send you a copy in a machine-readable format (JSON) or delete it, and reply within one month.`,
            "You also have the right to lodge a complaint with the Romanian supervisory authority, ANSPDCP (www.dataprotection.ro), or with the authority in your country of residence.",
          ],
        },
        {
          title: "Children",
          paragraphs: ["This website is not directed at children. If you are under 16, please do not send personal data through the contact form."],
        },
        { title: "Changes", paragraphs: ["If the way this site processes data changes, this page will be updated and the date below will change."] },
      ],
    };
  }
  return {
    intro:
      "Această notă explică ce date personale prelucrează acest site, de ce, pentru cât timp și ce drepturi ai. Site-ul este conceput să colecteze cât mai puține date: nu folosește analiză de trafic, publicitate sau urmărire.",
    sections: [
      {
        title: "Cine este operatorul",
        paragraphs: [
          `Operatorul de date este Ștefan-Emanuel Ciupitu, persoană fizică din Suceava, România, care poate fi contactat la ${email}. Acesta este un site personal, necomercial: nu se vinde nimic, iar vizitatorii nu își pot crea conturi.`,
        ],
      },
      {
        title: "Formularul de contact",
        paragraphs: [
          "Când îmi trimiți un mesaj, prelucrez numele, adresa de e-mail, subiectul (opțional) și mesajul, exclusiv pentru a-l citi și a-ți răspunde. Nu sunt cerute alte câmpuri.",
          "Temei legal: consimțământul tău (art. 6 alin. (1) lit. a) GDPR), exprimat prin bifarea căsuței, și demersurile făcute la cererea ta înaintea unui eventual contract (art. 6 alin. (1) lit. b) GDPR). Pentru a putea dovedi consimțământul, odată cu mesajul sunt păstrate data și ora la care l-ai dat și versiunea acestei politici afișate atunci. Îți poți retrage oricând consimțământul printr-un e-mail.",
          `Mesajele sunt stocate într-o bază de date și sunt șterse automat după ${retentionDays} de zile sau mai devreme, la cerere. O copie de notificare ajunge în căsuța mea de e-mail; răspunsul continuă prin e-mail.`,
        ],
      },
      {
        title: "Securitate și prevenirea abuzurilor",
        paragraphs: [
          "Pentru a proteja formularul de contact și zona de administrare împotriva spamului și a atacurilor de tip brute force, adresa ta IP (și, la încercările de autentificare, adresa de e-mail introdusă) este transformată pe server într-un hash ireversibil, cu cheie secretă (HMAC-SHA-256). Doar acest hash este păstrat, cel mult 24 de ore, într-un contor de limitare a cererilor. Aplicația nu stochează adresa IP propriu-zisă.",
          "Temei legal: interesul legitim de a menține serviciul în siguranță (art. 6 alin. (1) lit. f) GDPR).",
          "Furnizorul de găzduire poate păstra pentru scurt timp jurnale tehnice de acces (de exemplu adresa IP și pagina accesată), conform propriei politici.",
        ],
      },
      {
        title: "Cookie-uri și stocare locală",
        paragraphs: [
          "Nu folosesc cookie-uri de analiză, publicitate sau urmărire și nu încarc scripturi, fonturi sau conținut încorporat de la terți. Folosesc doar stocare strict necesară, exceptată de la consimțământ; detaliile sunt în politica de cookie-uri.",
        ],
      },
      {
        title: "Furnizori de servicii (persoane împuternicite) și transferuri internaționale",
        paragraphs: [
          "Vercel Inc. (găzduirea site-ului; funcțiile rulează în Statele Unite, regiunea Washington D.C.), Supabase Inc. (baza de date și stocarea fișierelor, găzduite în Statele Unite, regiunea North Virginia) și Resend (trimiterea e-mailurilor de notificare din regiunea UE, Irlanda). Acești furnizori acționează în numele meu, pe baza acordurilor lor de prelucrare a datelor. Deoarece Vercel și Supabase sunt companii din SUA, iar datele sunt stocate în SUA, transferurile se bazează pe Cadrul UE–SUA privind confidențialitatea datelor, acolo unde furnizorul este certificat, și în rest pe Clauzele Contractuale Standard ale UE incluse în acordurile lor.",
        ],
      },
      {
        title: "Drepturile tale și cum le exerciți",
        paragraphs: [
          "Ai dreptul de acces, rectificare, ștergere, restricționare a prelucrării, portabilitate și opoziție, precum și dreptul de a-ți retrage oricând consimțământul.",
          `Pentru a le exercita, scrie-mi la ${email} de pe adresa folosită în formular (așa îți este verificată identitatea). Voi căuta toate datele asociate acelei adrese, îți voi trimite o copie într-un format care poate fi citit automat (JSON) sau le voi șterge și îți voi răspunde în cel mult o lună.`,
          "Ai, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP, www.dataprotection.ro) sau la autoritatea din țara ta de reședință.",
        ],
      },
      {
        title: "Copii",
        paragraphs: ["Acest site nu se adresează copiilor. Dacă ai sub 16 ani, te rog să nu trimiți date personale prin formularul de contact."],
      },
      { title: "Modificări", paragraphs: ["Dacă modul în care site-ul prelucrează datele se schimbă, această pagină va fi actualizată, iar data de mai jos se va modifica."] },
    ],
  };
}

export type CookieRow = { name: string; type: string; purpose: string; duration: string; setWhen: string };

/** Exhaustive list of what the site stores in the browser (verified on the live site). */
export function cookiePolicy(locale: Locale): { intro: string; rows: CookieRow[]; sections: PrivacySection[] } {
  if (locale === "en") {
    return {
      intro:
        "This page lists everything this website stores in your browser. Only strictly necessary storage is used, so no consent banner is shown: there are no analytics, marketing or advertising cookies to accept or reject.",
      rows: [
        { name: "NEXT_LOCALE", type: "First-party cookie · necessary (preference)", purpose: "Remembers the language you chose (Romanian or English).", duration: "1 year", setWhen: "Only when you use the RO | EN switch." },
        { name: "theme", type: "Local storage · necessary (preference)", purpose: "Remembers whether you chose the light or dark theme.", duration: "Until you clear your browser data", setWhen: "Only when you press the theme button." },
        { name: "sb-…-auth-token", type: "First-party cookies · necessary (security)", purpose: "Keeps the site administrator signed in to the private dashboard.", duration: "Session; renewed while signed in", setWhen: "Only for the site administrator, after signing in at /admin." },
      ],
      sections: [
        { title: "Categories", paragraphs: ["Necessary: listed above. Functional, analytics, marketing: none are used."] },
        { title: "How to delete them", paragraphs: ["You can delete cookies and local storage at any time from your browser settings. The site keeps working; it will simply follow your system language and theme preferences again."] },
        { title: "Changes", paragraphs: ["If non-essential cookies are ever introduced, they will be loaded only after your explicit consent, through a banner that lets you accept, reject or customise them, and you will be able to change your choice at any time from this page."] },
      ],
    };
  }
  return {
    intro:
      "Această pagină enumeră tot ce stochează site-ul în browserul tău. Se folosește doar stocare strict necesară, de aceea nu este afișat un banner de consimțământ: nu există cookie-uri de analiză, marketing sau publicitate de acceptat ori refuzat.",
    rows: [
      { name: "NEXT_LOCALE", type: "Cookie propriu · necesar (preferință)", purpose: "Reține limba aleasă (română sau engleză).", duration: "1 an", setWhen: "Doar când folosești selectorul RO | EN." },
      { name: "theme", type: "Stocare locală · necesară (preferință)", purpose: "Reține dacă ai ales tema luminoasă sau întunecată.", duration: "Până ștergi datele browserului", setWhen: "Doar când apeși butonul de temă." },
      { name: "sb-…-auth-token", type: "Cookie-uri proprii · necesare (securitate)", purpose: "Mențin autentificarea administratorului site-ului în panoul privat.", duration: "Sesiune; reînnoite cât timp ești autentificat", setWhen: "Doar pentru administratorul site-ului, după autentificarea la /admin." },
    ],
    sections: [
      { title: "Categorii", paragraphs: ["Necesare: cele de mai sus. Funcționale, de analiză, de marketing: nu se folosesc."] },
      { title: "Cum le ștergi", paragraphs: ["Poți șterge oricând cookie-urile și stocarea locală din setările browserului. Site-ul funcționează în continuare; va urma din nou limba și tema setate în sistemul tău."] },
      { title: "Modificări", paragraphs: ["Dacă vor fi introduse vreodată cookie-uri neesențiale, ele vor fi încărcate doar după consimțământul tău explicit, printr-un banner care îți va permite să le accepți, să le refuzi sau să le personalizezi, iar alegerea o vei putea schimba oricând din această pagină."] },
    ],
  };
}
