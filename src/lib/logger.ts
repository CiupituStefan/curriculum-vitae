/*
 * Minimal structured logger. Emits one JSON line per event (Vercel log drains parse JSON).
 * Personal data and secrets must never be logged: `redact` strips known sensitive keys and
 * masks e-mail addresses defensively, even if a caller passes them by mistake.
 */
type Level = "info" | "warn" | "error";

const SENSITIVE_KEYS = /pass(word)?|secret|token|key|authorization|cookie|email|phone|message|ip/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth]";
  if (typeof value === "string") return value.replace(EMAIL_PATTERN, "[email]").slice(0, 500);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redact(item, depth + 1));
  if (value instanceof Error) return { name: value.name, message: redact(value.message, depth + 1) };
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        SENSITIVE_KEYS.test(key) ? "[redacted]" : redact(inner, depth + 1),
      ]),
    );
  }
  return value;
}

function emit(level: Level, event: string, context?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...(context ? { context: redact(context) } : {}),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) => emit("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) => emit("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) => emit("error", event, context),
};
