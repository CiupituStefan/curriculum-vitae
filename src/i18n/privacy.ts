import type { Locale } from "./config";

/*
 * Privacy policy text. It describes only the processing this application actually performs.
 * Keep it in sync with the code when features change (see docs/GDPR.md). It is a good-faith
 * transparency notice, not a certified legal assessment.
 */
export type PrivacySection = { title: string; paragraphs: string[] };

export const PRIVACY_UPDATED = "2026-11-03";

export function privacyPolicy(locale: Locale, email: string, retentionDays: number): { intro: string; sections: PrivacySection[] } {
  if (locale === "en") {
    return {
      intro:
        "This notice explains which personal data this website processes, why, for how long and what your rights are. The site is designed to collect as little data as possible.",
      sections: [
        { title: "Who is responsible", paragraphs: [`The controller is Ștefan-Emanuel Ciupitu, reachable at ${email}.`] },
        {
          title: "Contact form",
          paragraphs: [
            "When you send a message, I process your name, email address, the optional subject and the message itself, solely to read and answer it.",
            "Legal basis: your consent (Art. 6(1)(a) GDPR), given by ticking the box, and steps taken at your request before a possible contract (Art. 6(1)(b) GDPR). You can withdraw consent at any time by emailing me.",
            `Messages are stored in a database and automatically deleted after ${retentionDays} days, or earlier on request.`,
          ],
        },
        {
          title: "Security and abuse prevention",
          paragraphs: [
            "To protect the contact form and the administration area against spam and brute-force attacks, your IP address is converted on the server into a non-reversible keyed hash (HMAC-SHA-256). Only that hash is stored, for at most 24 hours, in a rate-limiting counter. The raw IP address is not stored by this application.",
            "Legal basis: legitimate interest in keeping the service secure (Art. 6(1)(f) GDPR).",
            "The hosting provider may keep technical access logs (for example IP address and requested URL) for a short period, under its own policy.",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "No analytics, advertising or tracking cookies are used, and no third-party tracking scripts are loaded.",
            "The site stores only what it strictly needs: a NEXT_LOCALE cookie with your language choice (1 year), your light/dark theme preference in your browser's local storage, and — for the site administrator only — authentication cookies for the dashboard. These are exempt from consent because they are strictly necessary.",
          ],
        },
        {
          title: "Service providers (processors)",
          paragraphs: [
            "Vercel Inc. (website hosting), Supabase Inc. (database and file storage) and, if email notifications are enabled, Resend (sending notification emails). These providers act on my behalf under data processing agreements. Some of them are based in the United States; transfers rely on the safeguards they offer, such as the EU Standard Contractual Clauses or the EU–U.S. Data Privacy Framework.",
          ],
        },
        {
          title: "Your rights",
          paragraphs: [
            "You have the right of access, rectification, erasure, restriction of processing, data portability and objection, and the right to withdraw consent at any time. To exercise them, email me; I will reply within one month.",
            "You also have the right to lodge a complaint with the Romanian supervisory authority, ANSPDCP (www.dataprotection.ro), or with the authority in your country of residence.",
          ],
        },
        { title: "Changes", paragraphs: ["If the way this site processes data changes, this page will be updated and the date below will change."] },
      ],
    };
  }
  return {
    intro:
      "Această notă explică ce date personale prelucrează acest site, de ce, pentru cât timp și ce drepturi ai. Site-ul este conceput să colecteze cât mai puține date.",
    sections: [
      { title: "Cine este operatorul", paragraphs: [`Operatorul de date este Ștefan-Emanuel Ciupitu, care poate fi contactat la ${email}.`] },
      {
        title: "Formularul de contact",
        paragraphs: [
          "Când îmi trimiți un mesaj, prelucrez numele, adresa de e-mail, subiectul (opțional) și mesajul, exclusiv pentru a-l citi și a-ți răspunde.",
          "Temei legal: consimțământul tău (art. 6 alin. (1) lit. a) GDPR), exprimat prin bifarea căsuței, și demersurile făcute la cererea ta înaintea unui eventual contract (art. 6 alin. (1) lit. b) GDPR). Îți poți retrage oricând consimțământul printr-un e-mail.",
          `Mesajele sunt stocate într-o bază de date și sunt șterse automat după ${retentionDays} de zile sau mai devreme, la cerere.`,
        ],
      },
      {
        title: "Securitate și prevenirea abuzurilor",
        paragraphs: [
          "Pentru a proteja formularul de contact și zona de administrare împotriva spamului și a atacurilor de tip brute force, adresa ta IP este transformată pe server într-un hash ireversibil, cu cheie secretă (HMAC-SHA-256). Doar acest hash este păstrat, cel mult 24 de ore, într-un contor de limitare a cererilor. Aplicația nu stochează adresa IP propriu-zisă.",
          "Temei legal: interesul legitim de a menține serviciul în siguranță (art. 6 alin. (1) lit. f) GDPR).",
          "Furnizorul de găzduire poate păstra pentru scurt timp jurnale tehnice de acces (de exemplu adresa IP și pagina accesată), conform propriei politici.",
        ],
      },
      {
        title: "Cookie-uri și stocare locală",
        paragraphs: [
          "Nu folosesc cookie-uri de analiză, publicitate sau urmărire și nu încarc scripturi de tracking de la terți.",
          "Site-ul stochează doar ce este strict necesar: un cookie NEXT_LOCALE cu limba aleasă (1 an), preferința pentru tema luminoasă/întunecată în stocarea locală a browserului și — doar pentru administratorul site-ului — cookie-uri de autentificare pentru panoul de administrare. Acestea sunt exceptate de la consimțământ deoarece sunt strict necesare.",
        ],
      },
      {
        title: "Furnizori de servicii (persoane împuternicite)",
        paragraphs: [
          "Vercel Inc. (găzduirea site-ului), Supabase Inc. (baza de date și stocarea fișierelor) și, dacă notificările prin e-mail sunt activate, Resend (trimiterea e-mailurilor de notificare). Acești furnizori acționează în numele meu, pe baza unor acorduri de prelucrare a datelor. Unii au sediul în Statele Unite; transferurile se bazează pe garanțiile oferite de aceștia, precum Clauzele Contractuale Standard ale UE sau Cadrul UE–SUA privind confidențialitatea datelor.",
        ],
      },
      {
        title: "Drepturile tale",
        paragraphs: [
          "Ai dreptul de acces, rectificare, ștergere, restricționare a prelucrării, portabilitate și opoziție, precum și dreptul de a-ți retrage oricând consimțământul. Pentru a le exercita, scrie-mi pe e-mail; îți voi răspunde în cel mult o lună.",
          "Ai, de asemenea, dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP, www.dataprotection.ro) sau la autoritatea din țara ta de reședință.",
        ],
      },
      { title: "Modificări", paragraphs: ["Dacă modul în care site-ul prelucrează datele se schimbă, această pagină va fi actualizată, iar data de mai jos se va modifica."] },
    ],
  };
}
