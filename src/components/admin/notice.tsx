import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { ReactNode } from "react";

const TONES = {
  info: { icon: Info, className: "border-line bg-surface-2 text-ink" },
  success: { icon: CircleCheck, className: "border-success/40 bg-success/5 text-success" },
  danger: { icon: CircleAlert, className: "border-danger/40 bg-danger/5 text-danger" },
} as const;

export function Notice({ tone = "info", children, className = "" }: { tone?: keyof typeof TONES; children: ReactNode; className?: string }) {
  const { icon: Icon, className: toneClass } = TONES[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex gap-3 rounded-xl border p-4 text-sm ${toneClass} ${className}`}>
      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
