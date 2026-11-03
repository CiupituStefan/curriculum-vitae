import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { safeRedirectPath } from "@/lib/security/redirect";
import { isCurrentUserAdmin } from "@/server/auth";
import { Notice } from "@/components/admin/notice";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Autentificare" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeRedirectPath((await searchParams).next, "/admin");
  if (await isCurrentUserAdmin()) redirect(next);
  const configured = isSupabaseConfigured();

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="card w-full max-w-sm p-8">
        <p className="eyebrow">Administrare</p>
        <h1 className="display mt-3 text-3xl">Autentificare</h1>
        <p className="mt-2 text-sm text-muted">Zonă privată. Accesul este permis doar administratorului site-ului.</p>
        {!configured ? (
          <Notice tone="danger" className="mt-6">
            Autentificarea nu este configurată: lipsesc variabilele NEXT_PUBLIC_SUPABASE_URL și NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Accesul este blocat (fail secure).
          </Notice>
        ) : null}
        <div className="mt-6">
          <LoginForm next={next} enabled={configured} />
        </div>
      </div>
    </main>
  );
}
