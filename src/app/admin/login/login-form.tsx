"use client";

import { LoaderCircle, Lock } from "lucide-react";
import { useActionState } from "react";
import { Notice } from "@/components/admin/notice";
import { signInAction, type LoginState } from "./actions";

const MESSAGES: Record<NonNullable<LoginState["error"]>, string> = {
  invalid: "E-mailul sau parola nu sunt corecte.",
  rate_limited: "Prea multe încercări. Așteaptă 15 minute și încearcă din nou.",
  unavailable: "Autentificarea nu este disponibilă momentan.",
  forbidden: "Contul nu are drepturi de administrare.",
};

export function LoginForm({ next, enabled }: { next: string; enabled: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="danger">{MESSAGES[state.error]}</Notice> : null}
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field mt-1.5" disabled={!enabled} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Parolă
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} className="field mt-1.5" disabled={!enabled} />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending || !enabled}>
        {pending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Lock size={16} aria-hidden="true" />}
        Autentifică-te
      </button>
    </form>
  );
}
