/**
 * Application error taxonomy. Error codes (not messages) cross the server/client boundary,
 * and the UI translates them, so internal details are never disclosed to visitors.
 */
export type ErrorCode =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "too_fast"
  | "conflict"
  | "unavailable"
  | "payload_too_large"
  | "unsupported_file"
  | "internal";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message ?? code);
    this.name = "AppError";
  }
}

export const HTTP_STATUS: Record<ErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  payload_too_large: 413,
  unsupported_file: 415,
  rate_limited: 429,
  too_fast: 429,
  internal: 500,
  unavailable: 503,
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: ErrorCode; fieldErrors?: Record<string, string> };

export function toErrorCode(error: unknown): ErrorCode {
  return error instanceof AppError ? error.code : "internal";
}
