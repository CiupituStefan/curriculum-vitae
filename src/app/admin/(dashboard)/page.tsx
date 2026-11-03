import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, FolderKanban, Inbox } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { requireAdmin } from "@/server/auth";
import { serverEnv } from "@/server/env.server";
import { getCvContent } from "@/server/services/content-service";
import { adminListProjects } from "@/server/services/project-service";
import { listMessages } from "@/server/services/contact-service";
import { Notice } from "@/components/admin/notice";

export const metadata: Metadata = { title: "Panou" };

export default async function AdminHome() {
  await requireAdmin();
  const [{ content, source }, projects, messages] = await Promise.all([getCvContent(), adminListProjects(), listMessages()]);
  const checks = [
    { label: "Supabase (bază de date, autentificare, fișiere)", ok: isSupabaseConfigured() && Boolean(serverEnv.SUPABASE_SECRET_KEY) },
    { label: "Notificări e-mail pentru formularul de contact (Resend)", ok: Boolean(serverEnv.RESEND_API_KEY && serverEnv.CONTACT_TO_EMAIL && serverEnv.CONTACT_FROM_EMAIL) },
    { label: "Sare pentru pseudonimizarea IP (IP_HASH_SALT)", ok: Boolean(serverEnv.IP_HASH_SALT) },
    { label: "Secret pentru jobul de retenție (CRON_SECRET)", ok: Boolean(serverEnv.CRON_SECRET) },
  ];

  const cards = [
    { href: "/admin/projects", label: "Proiecte", value: `${projects.length}`, detail: `${projects.filter((p) => p.status === "published").length} publicate`, icon: FolderKanban },
    { href: "/admin/messages", label: "Mesaje", value: `${messages.length}`, detail: `păstrate ${serverEnv.CONTACT_RETENTION_DAYS} de zile`, icon: Inbox },
    { href: "/admin/documents", label: "CV-uri PDF", value: "8", detail: "4 formate × 2 limbi", icon: FileText },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="display text-4xl">Bun venit</h1>
      <p className="mt-2 text-muted">Administrezi conținutul site-ului pentru {content.profile.fullName}, în română și engleză.</p>

      {source === "seed" ? (
        <Notice className="mt-6">
          Conținutul afișat provine din datele inițiale (seed). Rulează <code>supabase/seed.sql</code> sau salvează o secțiune pentru a-l stoca în baza de date.
        </Notice>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map(({ href, label, value, detail, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="card group block p-6 transition-colors hover:border-line-strong">
              <Icon size={18} aria-hidden="true" className="text-accent" />
              <p className="mt-4 text-sm text-muted">{label}</p>
              <p className="display mt-1 text-4xl tabular-nums">{value}</p>
              <p className="mt-1 flex items-center justify-between text-xs text-muted">
                {detail}
                <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="config-title">
        <h2 id="config-title" className="text-lg font-semibold">Configurare</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              {check.label}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${check.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                {check.ok ? "Configurat" : "Lipsește"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">Sunt afișate doar stările, niciodată valorile secretelor.</p>
      </section>
    </div>
  );
}
