export const CV_FORMATS = ["modern", "europass", "ats", "print"] as const;
export type CvFormat = (typeof CV_FORMATS)[number];

export function isCvFormat(value: unknown): value is CvFormat {
  return typeof value === "string" && (CV_FORMATS as readonly string[]).includes(value);
}
