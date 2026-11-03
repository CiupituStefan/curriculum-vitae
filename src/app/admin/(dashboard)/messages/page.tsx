import Link from "next/link";
import type { Metadata } from "next";
import { Download, Mail, Search, Trash2 } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { serverEnv } from "@/server/env.server";
import { findMessagesByEmail, listMessages } from "@/server/services/contact-service";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Notice } from "@/components/admin/notice";
import { deleteMessageAction, deleteMessagesByEmailAction } from "../../actions";

export const metadata: Metadata = { title: "Mesaje" };

type Props = { searchParams: Promise<{ email?: string; erased?: string }> };

export default async function MessagesPage({ searchParams }: Props) {
  await requireAdmin();
  const { email: rawEmail, erased } = await searchParams;
  const email = rawEmail?.trim() ?? "";
  let searchError = false;
  let messages: Awaited<ReturnType<typeof listMessages>> = [];
  if (email) {
    messages = await findMessagesByEmail(email).catch(() => {
      searchError = true;
      return [];
    });
  } else {
    messages = await listMessages();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="display text-4xl">Mesaje</h1>
      <p className="mt-2 text-muted">
        Mesajele din formularul de contact. Se șterg automat după {serverEnv.CONTACT_RETENTION_DAYS} de zile (politica de retenție).
      </p>

      <section aria-labelledby="dsar-title" className="card mt-8 p-6">
        <h2 id="dsar-title" className="text-lg font-semibold">Cereri privind datele personale</h2>
        <p className="mt-1 text-sm text-muted">
          Pentru o cerere de acces, export sau ștergere (art. 15–17 și 20 GDPR): caută adresa de e-mail a persoanei, verifică întâi că cererea
          vine chiar de la acea adresă, apoi descarcă datele sau șterge-le. Răspunde în cel mult o lună.
        </p>
        <form className="mt-4 flex flex-wrap gap-2" role="search">
          <label htmlFor="dsar-email" className="sr-only">
            Adresa de e-mail a persoanei
          </label>
          <input id="dsar-email" name="email" type="email" defaultValue={email} placeholder="nume@exemplu.ro" className="field max-w-sm text-sm" />
          <button className="btn btn-secondary min-h-0 h-11 text-sm">
            <Search size={15} aria-hidden="true" /> Caută
          </button>
          {email ? (
            <Link href="/admin/messages" className="btn btn-ghost min-h-0 h-11 text-sm">
              Toate mesajele
            </Link>
          ) : null}
        </form>
        {searchError ? <Notice tone="danger" className="mt-4">Adresa de e-mail nu este validă.</Notice> : null}
        {erased !== undefined ? (
          <Notice tone="success" className="mt-4">
            Cerere de ștergere finalizată: {erased} mesaj(e) șters(e) definitiv.
          </Notice>
        ) : null}
        {email && !searchError ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span>
              {messages.length} înregistrare(i) pentru <strong>{email}</strong>
            </span>
            <a href={`/admin/privacy-export?email=${encodeURIComponent(email)}`} className="btn btn-secondary min-h-0 h-9 text-sm">
              <Download size={15} aria-hidden="true" /> Exportă JSON
            </a>
            {messages.length > 0 ? (
              <form action={deleteMessagesByEmailAction}>
                <input type="hidden" name="email" value={email} />
                <ConfirmSubmit message={`Ștergi definitiv toate datele pentru ${email}?`} className="btn min-h-0 h-9 border border-danger/40 text-sm text-danger hover:bg-danger/5">
                  <Trash2 size={15} aria-hidden="true" /> Șterge toate datele acestei persoane
                </ConfirmSubmit>
              </form>
            ) : null}
          </div>
        ) : null}
      </section>

      {messages.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-muted">{email ? "Nicio înregistrare pentru această adresă." : "Niciun mesaj deocamdată."}</div>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{message.subject || "(fără subiect)"}</p>
                  <p className="mt-1 text-sm text-muted">
                    {message.name} · {message.email} · {message.locale.toUpperCase()} ·{" "}
                    <time dateTime={message.created_at}>{new Date(message.created_at).toLocaleString("ro-RO")}</time>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Consimțământ: <time dateTime={message.consent_at}>{new Date(message.consent_at).toLocaleString("ro-RO")}</time> · politica din {message.privacy_version}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "mesajul tău"}`)}`} className="btn btn-secondary min-h-0 h-9 text-sm">
                    <Mail size={15} aria-hidden="true" /> Răspunde
                  </a>
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <ConfirmSubmit message="Ștergi definitiv acest mesaj?" className="btn btn-ghost min-h-0 h-9 text-sm text-danger">
                      <Trash2 size={15} aria-hidden="true" /> Șterge
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
              {/* Rendered as text by React (auto-escaped): visitor input can never inject markup. */}
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
