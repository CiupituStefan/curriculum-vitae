import "server-only";
import { randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { STORAGE_BUCKET } from "@/lib/media";
import { MAX_IMAGE_PIXELS, validateUpload, type UploadPurpose } from "@/lib/security/file-validation";
import { sessionClient } from "@/server/supabase/clients";

const REASON_TO_CODE = {
  empty: "validation",
  too_large: "payload_too_large",
  unsupported_type: "unsupported_file",
  active_content: "unsupported_file",
} as const;

export type StoredImage = { path: string; width: number; height: number };
export type StoredDocument = { path: string; size: number };

/**
 * File storage. Images are decoded and re-encoded to WebP with sharp: this strips EXIF/GPS
 * metadata (privacy), neutralises polyglot files and normalises the format. Objects are written
 * with the admin's session, so Storage RLS policies apply as a second line of defence.
 */
export const storageService = {
  async storeImage(projectId: string, file: File): Promise<StoredImage> {
    const bytes = await readFile(file, "image");
    let output: { data: Buffer; info: OutputInfo };
    try {
      output = await sharp(bytes, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: "error" })
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new AppError("unsupported_file", "Image could not be decoded");
    }
    const path = `projects/${projectId}/${randomUUID()}.webp`;
    await upload(path, output.data, "image/webp");
    return { path, width: output.info.width, height: output.info.height };
  },

  async storeDocument(projectId: string, file: File): Promise<StoredDocument> {
    const bytes = await readFile(file, "document");
    const path = `projects/${projectId}/${randomUUID()}.pdf`;
    await upload(path, Buffer.from(bytes), "application/pdf");
    return { path, size: bytes.length };
  },

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const db = await sessionClient();
    const { error } = await db.storage.from(STORAGE_BUCKET).remove(paths);
    if (error) logger.warn("storage.remove_failed", { count: paths.length, error: error.message });
  },
};

async function readFile(file: File, purpose: UploadPurpose): Promise<Uint8Array> {
  if (!(file instanceof File)) throw new AppError("validation");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const outcome = validateUpload(bytes, purpose);
  if (!outcome.ok) throw new AppError(REASON_TO_CODE[outcome.reason], outcome.reason);
  return bytes;
}

async function upload(path: string, body: Buffer, contentType: string): Promise<void> {
  const db = await sessionClient();
  const { error } = await db.storage
    .from(STORAGE_BUCKET)
    .upload(path, body, { contentType, upsert: false, cacheControl: "31536000" });
  if (error) {
    logger.error("storage.upload_failed", { error: error.message });
    throw new AppError("internal", "Upload failed");
  }
}
