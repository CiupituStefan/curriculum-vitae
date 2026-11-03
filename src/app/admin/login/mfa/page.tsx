import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/security/redirect";
import { getCurrentUser, isMfaPending } from "@/server/auth";
import { signOutAction } from "../../actions";
import { MfaForm } from "./mfa-form";

export const metadata: Metadata = { title: "Verificare în doi pași" };

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeRedirectPath((await searchParams).next, "/admin");
  if (!(await getCurrentUser())) redirect("/admin/login");
  if (!(await isMfaPending())) redirect(next);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <p className="eyebrow">Administrare</p>
        <h1 className="display mt-3 text-3xl">Verificare în doi pași</h1>
        <p className="mt-2 text-sm text-muted">Introdu codul de 6 cifre afișat de aplicația ta de autentificare.</p>
        <div className="mt-6">
          <MfaForm next={next} />
        </div>
        <form action={signOutAction} className="mt-4 text-center">
          <button className="text-sm text-muted underline underline-offset-2 hover:text-ink">Anulează și deconectează-te</button>
        </form>
      </div>
    </main>
  );
}
