"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useActionState } from "react";
import { Notice } from "@/components/admin/notice";
import { verifyMfaAction, type MfaState } from "../actions";

const MESSAGES: Record<NonNullable<MfaState["error"]>, string> = {
  invalid_code: "Codul nu este corect sau a expirat. Introdu codul curent din aplicația de autentificare.",
  rate_limited: "Prea multe încercări. Așteaptă 15 minute și încearcă din nou.",
  unavailable: "Verificarea nu este disponibilă momentan.",
};

export function MfaForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<MfaState, FormData>(verifyMfaAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="danger">{MESSAGES[state.error]}</Notice> : null}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="code" className="text-sm font-medium">
          Cod din aplicația de autentificare
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          className="field mt-1.5 text-center text-2xl tracking-[0.4em] tabular-nums"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <ShieldCheck size={16} aria-hidden="true" />}
        Verifică
      </button>
    </form>
  );
}
