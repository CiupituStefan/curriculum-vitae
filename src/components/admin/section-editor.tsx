"use client";

import { ArrowDown, ArrowUp, ChevronDown, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useId, useState, useTransition } from "react";
import type { SectionKey } from "@/domain/content/schema";
import { saveSectionAction } from "@/app/admin/actions";
import { SECTION_FORMS, type Field } from "./section-forms";
import { Notice } from "./notice";

type Json = unknown;
type Obj = Record<string, Json>;

const get = (value: Json, name: string): Json => (name === "" ? value : (value as Obj | undefined)?.[name]);
const set = (value: Json, name: string, next: Json): Json => (name === "" ? next : { ...(value as Obj), [name]: next });
const pathGet = (value: Json, path: string): Json => path.split(".").reduce<Json>((acc, key) => (acc as Obj | undefined)?.[key], value);

const inputClass = "field mt-1 text-sm";

function Label({ htmlFor, children, hint, required }: { htmlFor?: string; children: string; hint?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
      {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

function LocalizedInput({ id, value, onChange, multiline, rows }: { id: string; value: Json; onChange: (v: Json) => void; multiline?: boolean; rows?: number }) {
  const current = (value as { ro?: string; en?: string }) ?? {};
  return (
    <div className="mt-1 grid gap-2 md:grid-cols-2">
      {(["ro", "en"] as const).map((lang) => {
        const props = {
          id: `${id}-${lang}`,
          value: current[lang] ?? "",
          lang,
          "aria-label": lang.toUpperCase(),
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ro: current.ro ?? "", en: current.en ?? "", [lang]: event.target.value }),
          className: `${inputClass} mt-0`,
        };
        return (
          <div key={lang} className="relative">
            <span className="pointer-events-none absolute right-2 top-2 rounded bg-surface-2 px-1.5 text-[10px] font-semibold text-muted">{lang.toUpperCase()}</span>
            {multiline ? <textarea rows={rows ?? 3} {...props} /> : <input type="text" {...props} />}
          </div>
        );
      })}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: Json; onChange: (v: Json) => void }) {
  const id = useId();
  switch (field.kind) {
    case "text":
      return (
        <div>
          <Label htmlFor={id} hint={field.hint} required={field.required}>
            {field.label}
          </Label>
          <input id={id} type={field.type ?? "text"} className={inputClass} value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />
        </div>
      );
    case "localized":
      return (
        <div className="md:col-span-2">
          <Label htmlFor={`${id}-ro`} hint={field.hint} required={field.required}>
            {field.label}
          </Label>
          <LocalizedInput id={id} value={value} onChange={onChange} multiline={field.multiline} rows={field.rows} />
        </div>
      );
    case "boolean":
      return (
        <label className="flex items-center gap-3 self-end py-2 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          <span>
            {field.label}
            {field.hint ? <span className="block text-xs text-muted">{field.hint}</span> : null}
          </span>
        </label>
      );
    case "select":
      return (
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          <select id={id} className={inputClass} value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)}>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "tags":
      return (
        <div className="md:col-span-2">
          <Label htmlFor={id} hint={field.hint}>
            {field.label}
          </Label>
          <TagsInput id={id} value={(value as string[]) ?? []} onChange={onChange} />
        </div>
      );
    case "localizedList": {
      const items = ((value as Json[]) ?? []) as Json[];
      return (
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{field.label}</legend>
          <ol className="mt-2 space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <LocalizedInput id={`${id}-${index}`} value={item} multiline={field.multiline} rows={2} onChange={(next) => onChange(items.map((current, i) => (i === index ? next : current)))} />
                </div>
                <RowControls index={index} length={items.length} onMove={(to) => onChange(move(items, index, to))} onRemove={() => onChange(items.filter((_, i) => i !== index))} />
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-secondary mt-3 min-h-0 h-9 text-sm" onClick={() => onChange([...items, { ro: "", en: "" }])}>
            <Plus size={15} aria-hidden="true" /> Adaugă
          </button>
        </fieldset>
      );
    }
    case "list":
      return <ListEditor field={field} value={value} onChange={onChange} />;
  }
}

function TagsInput({ id, value, onChange }: { id: string; value: string[]; onChange: (v: Json) => void }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      id={id}
      type="text"
      className={inputClass}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean));
      }}
    />
  );
}

function move<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item as T);
  return copy;
}

function RowControls({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-start gap-1">
      <button type="button" className="btn btn-ghost size-9 min-h-0 p-0" aria-label="Mută mai sus" title="Mută mai sus" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <ArrowUp size={15} aria-hidden="true" />
      </button>
      <button type="button" className="btn btn-ghost size-9 min-h-0 p-0" aria-label="Mută mai jos" title="Mută mai jos" disabled={index === length - 1} onClick={() => onMove(index + 1)}>
        <ArrowDown size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="btn btn-ghost size-9 min-h-0 p-0 text-danger"
        aria-label="Șterge"
        title="Șterge"
        onClick={() => {
          if (window.confirm("Ștergi acest element? Modificarea devine definitivă după salvare.")) onRemove();
        }}
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

function ListEditor({ field, value, onChange }: { field: Extract<Field, { kind: "list" }>; value: Json; onChange: (v: Json) => void }) {
  const items = ((value as Obj[]) ?? []) as Obj[];
  return (
    <fieldset className="md:col-span-2">
      {field.name ? <legend className="text-sm font-medium">{field.label}</legend> : null}
      <ol className="mt-2 space-y-3">
        {items.map((item, index) => {
          const title = String(pathGet(item, field.titleKey) ?? "") || `#${index + 1}`;
          return (
            <li key={index}>
              <details className="group rounded-2xl border border-line bg-surface open:shadow-card">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <ChevronDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
                  {/* preventDefault stops the buttons from also toggling the <details> element */}
                  <div onClick={(event) => event.preventDefault()}>
                    <RowControls index={index} length={items.length} onMove={(to) => onChange(move(items, index, to))} onRemove={() => onChange(items.filter((_, i) => i !== index))} />
                  </div>
                </summary>
                <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
                  {field.fields.map((child) => (
                    <FieldInput key={child.name} field={child} value={get(item, child.name)} onChange={(next) => onChange(items.map((current, i) => (i === index ? (set(current, child.name, next) as Obj) : current)))} />
                  ))}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      <button type="button" className="btn btn-secondary mt-3 min-h-0 h-9 text-sm" onClick={() => onChange([...items, field.newItem()])}>
        <Plus size={15} aria-hidden="true" /> Adaugă
      </button>
    </fieldset>
  );
}

export function SectionEditor({ section, initial, writable }: { section: SectionKey; initial: Json; writable: boolean }) {
  const form = SECTION_FORMS[section];
  const [value, setValue] = useState<Json>(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string; details?: string[] } | null>(null);

  const update = (next: Json) => {
    setValue(next);
    setDirty(true);
    setResult(null);
  };

  const save = () =>
    startTransition(async () => {
      const response = await saveSectionAction(section, JSON.stringify(value));
      if (response.ok) {
        setDirty(false);
        setResult({ ok: true, message: "Modificările au fost salvate și sunt deja vizibile pe site și în PDF-uri." });
      } else {
        setResult({
          ok: false,
          message: response.code === "validation" ? "Unele câmpuri nu sunt valide. Corectează-le și salvează din nou." : `Salvarea a eșuat (${response.code}).`,
          details: response.fieldErrors ? Object.entries(response.fieldErrors).map(([path, message]) => `${path || "secțiune"}: ${message}`) : undefined,
        });
      }
    });

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {form.root.kind === "object" ? (
          form.root.fields.map((field) => <FieldInput key={field.name || "root"} field={field} value={get(value, field.name)} onChange={(next) => update(set(value, field.name, next))} />)
        ) : (
          <ListEditor field={form.root} value={value} onChange={update} />
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-8 border-t border-line bg-bg/90 px-4 py-4 backdrop-blur">
        {result ? (
          <Notice tone={result.ok ? "success" : "danger"} className="mb-3">
            {result.message}
            {result.details ? (
              <ul className="mt-2 list-disc pl-5 text-xs">
                {result.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Notice>
        ) : null}
        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={save} disabled={pending || !dirty || !writable}>
            {pending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <Save size={16} aria-hidden="true" />}
            Salvează secțiunea
          </button>
          {dirty ? <span className="text-sm text-muted">Modificări nesalvate</span> : null}
        </div>
      </div>
    </div>
  );
}
