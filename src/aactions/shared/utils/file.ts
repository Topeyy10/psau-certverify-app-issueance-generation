import { uniqueId } from "@/lib/server/id";
import { getSafeFileExtension } from "./sanitize";

export { getSafeFileExtension, sanitizeFilename } from "./sanitize";

export function getSafeFilename(file: File): string {
  const systemId = uniqueId();
  const extension = getSafeFileExtension(file);

  return `${systemId}.${extension}`;
}
