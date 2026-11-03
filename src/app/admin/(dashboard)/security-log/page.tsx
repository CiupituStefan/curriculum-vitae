import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { listSecurityEvents } from "@/server/services/security-events";

export const metadata: Metadata = { title: "Jurnal de securitate" };

const LABELS: Record<string, string> = {
  "auth.login_succeeded": "Autentificare reușită",
  "auth.login_failed": "Autentificare eșuată",
  "auth.login_rate_limited": "Autentificare blocată (prea multe încercări)",
  "auth.login_not_admin": "Autentificare refuzată (cont fără drept de admin)",
  "auth.mfa_enrolled": "MFA activat",
  "auth.mfa_removed": "MFA eliminat",
  "auth.mfa_login_succeeded": "Verificare MFA reușită",
  "auth.mfa_verify_failed": "Cod MFA greșit",
  "auth.signed_out": "Deconectare",
  "admin.content_saved": "Conținut CV salvat",
  "admin.revision_restored": "Versiune restaurată",
  "admin.project_created": "Proiect creat",
  "admin.project_updated": "Proiect modificat",
  "admin.project_deleted": "Proiect șters",
  "admin.file_uploaded": "Fișier încărcat",
  "admin.file_removed": "Fișier șters",
  "admin.message_deleted": "Mesaj șters",
  "privacy.data_exported": "Export date personale (cerere GDPR)",
  "privacy.data_erased": "Ștergere date personale (cerere GDPR)",
  "contact.rate_limited": "Formular de contact blocat (limită)",
  "retention.purged": "Ștergere automată (retenție)",
};
const ALERT = new Set(["auth.login_failed", "auth.login_rate_limited", "auth.login_not_admin", "auth.mfa_removed", "auth.mfa_verify_failed", "contact.rate_limited"]);

/** Events needing attention in the last 24 hours (kept outside render for purity). */
function recentAlerts(events: { event: string; at: string }[]): number {
  const cutoff = Date.now() - 86_400_000;
  return events.filter((e) => ALERT.has(e.event) && new Date(e.at).getTime() >= cutoff).length;
}

export default async function SecurityLogPage() {
  await requireAdmin();
  const events = await listSecurityEvents();
  const failures24h = recentAlerts(events);
  return (
    <div className="max-w-5xl">
      <h1 className="display text-4xl">Jurnal de securitate</h1>
      <p className="mt-2 text-muted">
        Evenimentele de securitate (autentificări, MFA, modificări de conținut, cereri GDPR). Jurnalul poate fi doar citit — nu poate fi
        modificat sau șters prin aplicație — și este păstrat 365 de zile. Analizează-l cel puțin lunar (ISO/IEC 27001 A.12.4).
      </p>
      <p className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-medium ${failures24h > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
        Evenimente de atenție în ultimele 24 h: {failures24h}
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Data</th>
              <th scope="col" className="px-4 py-3 font-semibold">Eveniment</th>
              <th scope="col" className="px-4 py-3 font-semibold">Detalii</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {events.map((event) => (
              <tr key={event.id} className={ALERT.has(event.event) ? "bg-danger/5" : undefined}>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-muted">
                  <time dateTime={event.at}>{new Date(event.at).toLocaleString("ro-RO")}</time>
                </td>
                <td className="px-4 py-2.5">{LABELS[event.event] ?? event.event}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted">{Object.keys(event.details).length ? JSON.stringify(event.details) : "—"}</td>
              </tr>
            ))}
            {events.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted">Niciun eveniment înregistrat încă.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
