"use client";

import Link from "next/link";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { sendContactMessage, type ContactState } from "@/app/[locale]/contact/actions";

type Labels = Dictionary["contact"];
type ErrorKey = keyof Labels["errors"];
type FieldName = "name" | "email" | "subject" | "message" | "consent";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Client-side checks mirror the server schema for instant feedback; the server stays authoritative. */
function validate(name: FieldName, value: string | boolean): ErrorKey | undefined {
  if (name === "name") return String(value).trim().length < 2 ? "name_short" : String(value).length > 100 ? "name_long" : undefined;
  if (name === "email") return EMAIL.test(String(value).trim()) ? undefined : "email_invalid";
  if (name === "subject") return String(value).length > 150 ? "subject_long" : undefined;
  if (name === "message") return String(value).trim().length < 20 ? "message_short" : String(value).length > 5000 ? "message_long" : undefined;
  if (name === "consent") return value ? undefined : "consent_required";
  return undefined;
}

export function ContactForm({ locale, labels }: { locale: Locale; labels: Labels }) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendContactMessage, { status: "idle" });
  const [errors, setErrors] = useState<Partial<Record<FieldName, ErrorKey>>>({});
  const [seenState, setSeenState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(0);

  // Sync server-side field errors into local state when a new result arrives
  // ("adjusting state while rendering" pattern — no effect, no cascading render).
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error" && state.fieldErrors) {
      const known = Object.entries(state.fieldErrors).filter(([, code]) => code in labels.errors);
      setErrors(Object.fromEntries(known) as Partial<Record<FieldName, ErrorKey>>);
    }
  }

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  useEffect(() => {
    startedRef.current = Date.now();
  }, []);

  /** Adds the render timestamp (bot-timing check) to the submitted data. */
  const submit = (formData: FormData) => {
    formData.set("startedAt", String(startedRef.current || Date.now()));
    return formAction(formData);
  };

  const onBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.currentTarget.name as FieldName;
    const value = event.currentTarget.type === "checkbox" ? (event.currentTarget as HTMLInputElement).checked : event.currentTarget.value;
    setErrors((current) => ({ ...current, [field]: validate(field, value) }));
  };
  const onInput = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.currentTarget.name as FieldName;
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const next: Partial<Record<FieldName, ErrorKey>> = {};
    for (const field of ["name", "email", "subject", "message"] as const) next[field] = validate(field, String(data.get(field) ?? ""));
    next.consent = validate("consent", data.get("consent") === "on");
    const hasErrors = Object.values(next).some(Boolean);
    setErrors(next);
    if (hasErrors) {
      event.preventDefault();
      const first = (Object.keys(next) as FieldName[]).find((key) => next[key]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="card p-8 focus:outline-none" data-testid="contact-success">
        <CircleCheck size={28} aria-hidden="true" className="text-success" />
        <h2 className="display mt-4 text-2xl">{labels.successTitle}</h2>
        <p className="mt-2 text-muted">{labels.success}</p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => window.location.reload()}>
          {labels.sendAnother}
        </button>
      </div>
    );
  }

  const fieldClass = "field mt-1.5";
  const errorText = (field: FieldName) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger">
        <CircleAlert size={14} aria-hidden="true" />
        {labels.errors[errors[field]!]}
      </p>
    ) : null;
  const describedBy = (field: FieldName, hint?: string) => [errors[field] && `${field}-error`, hint].filter(Boolean).join(" ") || undefined;

  const serverError =
    state.status === "error" && state.code !== "validation"
      ? labels.errors[(["rate_limited", "unavailable", "too_fast"].includes(state.code) ? state.code : "generic") as ErrorKey]
      : null;

  return (
    <form ref={formRef} action={submit} onSubmit={onSubmit} noValidate className="card p-6 sm:p-8" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="display text-2xl">
        {labels.formTitle}
      </h2>

      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
        {serverError ? (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger" data-testid="contact-error">
            <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {serverError}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="locale" value={locale} />
            {/* Honeypot: visually hidden and skipped by assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">{labels.honeypot}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            {labels.name}
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required maxLength={100} className={fieldClass} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name")} onBlur={onBlur} onInput={onInput} />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            {labels.email}
          </label>
          <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} className={fieldClass} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} onBlur={onBlur} onInput={onInput} />
          {errorText("email")}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="subject" className="text-sm font-medium">
          {labels.subject} <span className="font-normal text-muted">({labels.subjectHint})</span>
        </label>
        <input id="subject" name="subject" type="text" maxLength={150} className={fieldClass} aria-invalid={Boolean(errors.subject)} aria-describedby={describedBy("subject")} onBlur={onBlur} onInput={onInput} />
        {errorText("subject")}
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="text-sm font-medium">
          {labels.message}
        </label>
        <textarea id="message" name="message" rows={6} required maxLength={5000} className={`${fieldClass} resize-y`} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy("message", "message-hint")} onBlur={onBlur} onInput={onInput} />
        <p id="message-hint" className="mt-1.5 text-xs text-muted">
          {labels.messageHint}
        </p>
        {errorText("message")}
      </div>

      <div className="mt-5">
        <div className="flex items-start gap-3">
          <input id="consent" name="consent" type="checkbox" required className="mt-1 size-4 shrink-0 accent-[var(--accent)]" aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy("consent")} onBlur={onBlur} onInput={onInput} />
          <label htmlFor="consent" className="text-sm text-muted">
            {labels.consent}{" "}
            <Link href={`/${locale}/privacy`} className="text-ink underline underline-offset-2">
              {labels.privacyLink}
            </Link>
            .
          </label>
        </div>
        {errorText("consent")}
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-7 w-full sm:w-auto" data-testid="contact-submit">
        {pending ? <LoaderCircle size={18} aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <Send size={16} aria-hidden="true" />}
        {pending ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
