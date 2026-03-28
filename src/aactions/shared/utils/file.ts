import { clientUniqueId } from "@/lib/id";
import { getSafeFileExtension } from "./sanitize";

export { getSafeFileExtension, sanitizeFilename } from "./sanitize";

export function getSafeFilename(file: File): string {
  const systemId = clientUniqueId();
  const extension = getSafeFileExtension(file);

  return `${systemId}.${extension}`;
}
