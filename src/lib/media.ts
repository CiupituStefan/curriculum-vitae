import { publicEnv } from "./env";

export const STORAGE_BUCKET = "portfolio";

/** Public URL of an object in the portfolio bucket (only server-generated keys are ever stored). */
export function mediaUrl(path: string, downloadName?: string): string {
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const query = downloadName ? `?download=${encodeURIComponent(downloadName)}` : "";
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${encoded}${query}`;
}
