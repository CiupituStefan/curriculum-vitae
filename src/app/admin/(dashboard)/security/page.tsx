import type { Metadata } from "next";
import { ShieldCheck, Trash2 } from "lucide-react";
import { requireAdmin } from "@/server/auth";
import { getMfaStatus } from "@/server/services/mfa-service";
import { MfaEnroll } from "@/components/admin/mfa-enroll";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Notice } from "@/components/admin/notice";
import { removeMfaFactorAction } from "../../actions";

export const metadata: Metadata = { title: "Securitate" };

export default async function SecurityPage() {
  const { user } = await requireAdmin();
  const mfa = await getMfaStatus();
  return (
    <div className="max-w-3xl">
      <h1 className="display text-4xl">Securitate</h1>
      <p className="mt-2 text-muted">Contul de administrare: {user.email}</p>

      <section className="card mt-8 p-6" aria-labelledby="mfa-title">
        <h2 id="mfa-title" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck size={18} aria-hidden="true" className="text-accent" /> Verificare în doi pași (TOTP)
        </h2>
        {mfa.enabled ? (
          <>
            <Notice tone="success" className="mt-4">
              Activă. Accesul la panou și la datele protejate necesită codul din aplicație, verificat atât de aplicație, cât și de baza de date.
            </Notice>
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
              {mfa.factors.map((factor) => (
                <li key={factor.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    {factor.friendlyName}
                    <span className="block text-xs text-muted">adăugat {new Date(factor.createdAt).toLocaleString("ro-RO")}</span>
                  </span>
                  <form action={removeMfaFactorAction}>
                    <input type="hidden" name="factorId" value={factor.id} />
                    <ConfirmSubmit message="Dezactivezi verificarea în doi pași? Contul va fi protejat doar de parolă." className="btn btn-ghost min-h-0 h-9 text-sm text-danger">
                      <Trash2 size={15} aria-hidden="true" /> Elimină
                    </ConfirmSubmit>
                  </form>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Notice tone="danger" className="mt-4">
              Inactivă: contul este protejat doar de parolă. Recomandat: activează verificarea în doi pași.
            </Notice>
            <div className="mt-5">
              <MfaEnroll />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
