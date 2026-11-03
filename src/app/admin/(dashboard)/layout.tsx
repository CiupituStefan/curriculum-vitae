import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { getCurrentUser, isCurrentUserAdmin } from "@/server/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { signOutAction } from "../actions";

/**
 * Server-side gate for every dashboard page: unauthenticated → login; authenticated but not an
 * admin → 403 view. Data access below is additionally protected by requireAdmin() and RLS.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!(await isCurrentUserAdmin())) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="display text-3xl">Acces interzis</h1>
          <p className="mt-3 text-muted">Contul tău nu are drepturi de administrare.</p>
          <form action={signOutAction} className="mt-6">
            <button className="btn btn-secondary">Deconectare</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-4">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-2">
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-ink font-display text-sm text-bg">
              ȘC
            </span>
            <span className="text-sm font-semibold">Administrare</span>
          </Link>
          <AdminNav />
          <div className="mt-6 border-t border-line pt-4 lg:mt-auto">
            <p className="truncate px-2 text-xs text-muted" title={user.email}>
              {user.email}
            </p>
            <form action={signOutAction} className="mt-2">
              <button className="btn btn-ghost w-full justify-start text-sm">
                <LogOut size={16} aria-hidden="true" /> Deconectare
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
