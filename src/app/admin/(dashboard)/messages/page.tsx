import type { Metadata } from "next";
import { Mail, Trash2 } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { serverEnv } from "@/server/env.server";
import { listMessages } from "@/server/services/contact-service";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { deleteMessageAction } from "../../actions";

export const metadata: Metadata = { title: "Mesaje" };

export default async function MessagesPage() {
  await requireAdmin();
  const messages = await listMessages();
  return (
    <div className="max-w-4xl">
      <h1 className="display text-4xl">Mesaje</h1>
      <p className="mt-2 text-muted">
        Mesajele din formularul de contact. Se șterg automat după {serverEnv.CONTACT_RETENTION_DAYS} de zile (politica de retenție).
      </p>
      {messages.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-muted">Niciun mesaj deocamdată.</div>
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
