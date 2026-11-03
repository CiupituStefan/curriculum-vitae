import type { SectionKey } from "@/domain/content/schema";
import { cefrLevels, experienceKinds, skillLevels } from "@/domain/content/schema";

/*
 * Declarative form definitions for every CV section. One generic editor renders them all
 * (DRY); validation lives in the Zod schemas and is enforced again on the server.
 */

export type Field =
  | { kind: "text"; name: string; label: string; type?: "text" | "email" | "url" | "month" | "tel"; hint?: string; required?: boolean }
  | { kind: "localized"; name: string; label: string; multiline?: boolean; rows?: number; hint?: string; required?: boolean }
  | { kind: "boolean"; name: string; label: string; hint?: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "tags"; name: string; label: string; hint?: string }
  | { kind: "localizedList"; name: string; label: string; multiline?: boolean }
  | { kind: "list"; name: string; label: string; titleKey: string; fields: Field[]; newItem: () => Record<string, unknown> };

export type SectionForm = { title: string; description: string; root: { kind: "object"; fields: Field[] } | Extract<Field, { kind: "list" }> };

const E = () => ({ ro: "", en: "" });
const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
const optional = (options: { value: string; label: string }[]) => [{ value: "", label: "—" }, ...options];

const idField: Field = { kind: "text", name: "id", label: "Identificator intern", hint: "litere mici, cifre și cratimă", required: true };
const cefr = optional(cefrLevels.map((value) => ({ value, label: value })));

export const SECTION_FORMS: Record<SectionKey, SectionForm> = {
  profile: {
    title: "Profil profesional",
    description: "Numele, titlul, prezentarea și mesajul de valoare afișate în Hero și în CV.",
    root: {
      kind: "object",
      fields: [
        { kind: "text", name: "fullName", label: "Nume complet", required: true },
        { kind: "localized", name: "headline", label: "Titlu profesional", required: true },
        { kind: "localized", name: "summary", label: "Prezentare scurtă", multiline: true, rows: 3, required: true },
        { kind: "localized", name: "about", label: "Despre mine", multiline: true, rows: 6 },
        { kind: "localized", name: "valueProposition", label: "Ce aduc unei companii", multiline: true, rows: 4 },
        { kind: "localized", name: "location", label: "Locație" },
        { kind: "localized", name: "photoAlt", label: "Text alternativ pentru fotografie" },
        { kind: "localizedList", name: "focusAreas", label: "Arii de expertiză (chip-uri din Hero)" },
      ],
    },
  },
  contact: {
    title: "Date de contact",
    description: "Ce date de contact sunt publicate pe site și în PDF-uri.",
    root: {
      kind: "object",
      fields: [
        { kind: "text", name: "email", label: "E-mail", type: "email", required: true },
        { kind: "text", name: "phone", label: "Telefon", type: "tel" },
        { kind: "boolean", name: "showPhone", label: "Publică telefonul pe site", hint: "Dezactivat implicit (protecția datelor)." },
        { kind: "boolean", name: "showPhoneInPdf", label: "Include telefonul în CV-urile PDF" },
        { kind: "text", name: "linkedin", label: "LinkedIn", type: "url" },
        { kind: "text", name: "github", label: "GitHub", type: "url" },
        { kind: "text", name: "youtube", label: "YouTube", type: "url" },
        {
          kind: "list",
          name: "otherLinks",
          label: "Alte profiluri",
          titleKey: "label",
          newItem: () => ({ label: "", url: "" }),
          fields: [
            { kind: "text", name: "label", label: "Etichetă", required: true },
            { kind: "text", name: "url", label: "URL", type: "url", required: true },
          ],
        },
      ],
    },
  },
  experience: {
    title: "Experiență profesională",
    description: "Pozițiile sunt sortate automat după dată pe site și în PDF.",
    root: {
      kind: "list",
      name: "",
      label: "Experiențe",
      titleKey: "organization",
      newItem: () => ({ id: rid("exp"), kind: "work", organization: "", organizationUrl: "", role: E(), location: E(), start: "", end: "", summary: E(), responsibilities: [], achievements: [], skills: [] }),
      fields: [
        idField,
        { kind: "select", name: "kind", label: "Tip", options: experienceKinds.map((value) => ({ value, label: value })) },
        { kind: "text", name: "organization", label: "Companie / organizație", required: true },
        { kind: "text", name: "organizationUrl", label: "Site companie", type: "url" },
        { kind: "localized", name: "role", label: "Funcție", required: true },
        { kind: "localized", name: "location", label: "Locație" },
        { kind: "text", name: "start", label: "Început", type: "month", required: true },
        { kind: "text", name: "end", label: "Sfârșit", type: "month", hint: "Gol = în prezent" },
        { kind: "localized", name: "summary", label: "Descriere", multiline: true, rows: 3 },
        { kind: "localizedList", name: "responsibilities", label: "Responsabilități", multiline: true },
        { kind: "localizedList", name: "achievements", label: "Realizări / rezultate măsurabile", multiline: true },
        { kind: "tags", name: "skills", label: "Competențe", hint: "Separate prin virgulă" },
      ],
    },
  },
  education: {
    title: "Educație și studii",
    description: "Studii universitare și preuniversitare.",
    root: {
      kind: "list",
      name: "",
      label: "Studii",
      titleKey: "degree.ro",
      newItem: () => ({ id: rid("edu"), institution: E(), institutionUrl: "", degree: E(), field: E(), specialization: E(), location: E(), start: "", end: "", ongoing: false, details: E() }),
      fields: [
        idField,
        { kind: "localized", name: "institution", label: "Instituție", required: true },
        { kind: "text", name: "institutionUrl", label: "Site instituție", type: "url" },
        { kind: "localized", name: "degree", label: "Diplomă / nivel", required: true },
        { kind: "localized", name: "field", label: "Domeniu" },
        { kind: "localized", name: "specialization", label: "Specializare" },
        { kind: "localized", name: "location", label: "Locație" },
        { kind: "text", name: "start", label: "Început", type: "month" },
        { kind: "text", name: "end", label: "Sfârșit", type: "month" },
        { kind: "boolean", name: "ongoing", label: "În curs" },
        { kind: "localized", name: "details", label: "Detalii", multiline: true, rows: 3 },
      ],
    },
  },
  skills: {
    title: "Competențe tehnice",
    description: "Grupuri de competențe, cu nivel opțional.",
    root: {
      kind: "list",
      name: "",
      label: "Grupuri",
      titleKey: "name.ro",
      newItem: () => ({ id: rid("skills"), name: E(), skills: [] }),
      fields: [
        idField,
        { kind: "localized", name: "name", label: "Nume grup", required: true },
        {
          kind: "list",
          name: "skills",
          label: "Competențe",
          titleKey: "name.ro",
          newItem: () => ({ name: E(), level: "", detail: E() }),
          fields: [
            { kind: "localized", name: "name", label: "Competență", required: true },
            { kind: "select", name: "level", label: "Nivel", options: optional(skillLevels.map((value) => ({ value, label: value }))) },
            { kind: "localized", name: "detail", label: "Detaliu (ex. instrumente)" },
          ],
        },
      ],
    },
  },
  personalSkills: {
    title: "Competențe personale",
    description: "Competențe transversale (soft skills).",
    root: { kind: "object", fields: [{ kind: "localizedList", name: "", label: "Competențe personale" }] },
  },
  languages: {
    title: "Limbi străine",
    description: "Niveluri conform CECRL (grila Europass).",
    root: {
      kind: "list",
      name: "",
      label: "Limbi",
      titleKey: "name.ro",
      newItem: () => ({ id: rid("lang"), name: E(), native: false, listening: "", reading: "", spokenInteraction: "", spokenProduction: "", writing: "" }),
      fields: [
        idField,
        { kind: "localized", name: "name", label: "Limba", required: true },
        { kind: "boolean", name: "native", label: "Limbă maternă" },
        { kind: "select", name: "listening", label: "Ascultare", options: cefr },
        { kind: "select", name: "reading", label: "Citire", options: cefr },
        { kind: "select", name: "spokenInteraction", label: "Conversație", options: cefr },
        { kind: "select", name: "spokenProduction", label: "Exprimare orală", options: cefr },
        { kind: "select", name: "writing", label: "Scriere", options: cefr },
      ],
    },
  },
  certifications: {
    title: "Certificări",
    description: "Certificările sunt grupate după câmpul „Grup”.",
    root: {
      kind: "list",
      name: "",
      label: "Certificări",
      titleKey: "name.ro",
      newItem: () => ({ id: rid("cert"), name: E(), issuer: "", group: E(), date: "", url: "" }),
      fields: [
        idField,
        { kind: "localized", name: "name", label: "Denumire", required: true },
        { kind: "text", name: "issuer", label: "Emitent" },
        { kind: "localized", name: "group", label: "Grup" },
        { kind: "text", name: "date", label: "Data obținerii", type: "month" },
        { kind: "text", name: "url", label: "Link de verificare", type: "url" },
      ],
    },
  },
  courses: {
    title: "Cursuri și calificări",
    description: "Programe de formare, cursuri și calificări.",
    root: {
      kind: "list",
      name: "",
      label: "Cursuri",
      titleKey: "name.ro",
      newItem: () => ({ id: rid("course"), name: E(), provider: E(), start: "", end: "", ongoing: false, description: E() }),
      fields: [
        idField,
        { kind: "localized", name: "name", label: "Denumire", required: true },
        { kind: "localized", name: "provider", label: "Furnizor" },
        { kind: "text", name: "start", label: "Început", type: "month" },
        { kind: "text", name: "end", label: "Sfârșit", type: "month" },
        { kind: "boolean", name: "ongoing", label: "În curs" },
        { kind: "localized", name: "description", label: "Descriere", multiline: true, rows: 3 },
      ],
    },
  },
  volunteering: {
    title: "Voluntariat",
    description: "Activități de voluntariat și implicare în organizații.",
    root: {
      kind: "list",
      name: "",
      label: "Voluntariat",
      titleKey: "organization",
      newItem: () => ({ id: rid("vol"), organization: "", organizationUrl: "", role: E(), location: E(), start: "", end: "", description: E() }),
      fields: [
        idField,
        { kind: "text", name: "organization", label: "Organizație", required: true },
        { kind: "text", name: "organizationUrl", label: "Site", type: "url" },
        { kind: "localized", name: "role", label: "Rol", required: true },
        { kind: "localized", name: "location", label: "Locație" },
        { kind: "text", name: "start", label: "Început", type: "month" },
        { kind: "text", name: "end", label: "Sfârșit", type: "month" },
        { kind: "localized", name: "description", label: "Descriere", multiline: true, rows: 3 },
      ],
    },
  },
  awards: {
    title: "Premii și realizări",
    description: "Secțiunea apare pe site doar dacă are cel puțin o intrare.",
    root: {
      kind: "list",
      name: "",
      label: "Premii",
      titleKey: "title.ro",
      newItem: () => ({ id: rid("award"), title: E(), issuer: "", date: "", description: E() }),
      fields: [
        idField,
        { kind: "localized", name: "title", label: "Titlu", required: true },
        { kind: "text", name: "issuer", label: "Acordat de" },
        { kind: "text", name: "date", label: "Data", type: "month" },
        { kind: "localized", name: "description", label: "Descriere", multiline: true, rows: 3 },
      ],
    },
  },
  otherInfo: {
    title: "Alte informații",
    description: "Ex.: referințe, permis de conducere, disponibilitate.",
    root: {
      kind: "list",
      name: "",
      label: "Informații",
      titleKey: "title.ro",
      newItem: () => ({ id: rid("info"), title: E(), description: E() }),
      fields: [
        idField,
        { kind: "localized", name: "title", label: "Titlu", required: true },
        { kind: "localized", name: "description", label: "Descriere", multiline: true, rows: 3, required: true },
      ],
    },
  },
  seo: {
    title: "SEO",
    description: "Titlul și descrierea paginii principale în motoarele de căutare și la distribuire.",
    root: {
      kind: "object",
      fields: [
        { kind: "localized", name: "title", label: "Titlu (max. 70 caractere)", required: true },
        { kind: "localized", name: "description", label: "Descriere (max. 170 caractere)", multiline: true, rows: 3, required: true },
      ],
    },
  },
};
