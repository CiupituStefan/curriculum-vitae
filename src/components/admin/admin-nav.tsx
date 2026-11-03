"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FileText, FolderKanban, Inbox, LayoutDashboard, PenLine, ShieldCheck } from "lucide-react";
import { SECTION_KEYS } from "@/domain/content/schema";
import { SECTION_FORMS } from "./section-forms";

export function AdminNav() {
  const pathname = usePathname();
  const item = (href: string, label: string, icon: React.ReactNode, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:font-medium aria-[current=page]:text-ink"
        >
          {icon}
          {label}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label="Administrare" className="mt-4 overflow-y-auto">
      <ul className="space-y-0.5">
        {item("/admin", "Panou", <LayoutDashboard size={16} aria-hidden="true" />, true)}
        {item("/admin/projects", "Proiecte", <FolderKanban size={16} aria-hidden="true" />)}
        {item("/admin/messages", "Mesaje", <Inbox size={16} aria-hidden="true" />)}
        {item("/admin/documents", "CV-uri PDF", <FileText size={16} aria-hidden="true" />)}
        {item("/admin/security", "Securitate", <ShieldCheck size={16} aria-hidden="true" />)}
      </ul>
      <p className="mt-6 px-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Conținut CV</p>
      <ul className="mt-2 space-y-0.5">
        {SECTION_KEYS.map((key) => item(`/admin/content/${key}`, SECTION_FORMS[key].title, <PenLine size={15} aria-hidden="true" />))}
      </ul>
      <ul className="mt-6 space-y-0.5">
        <li>
          <a href="/ro" target="_blank" rel="noopener" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink">
            <ExternalLink size={16} aria-hidden="true" /> Vezi site-ul
          </a>
        </li>
      </ul>
    </nav>
  );
}
