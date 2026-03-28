const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/json": "json",
};

export function getSafeFileExtension(file: File): string {
  function sanitize(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 5);
  }

  const mimeExt = MIME_TO_EXT[file.type];
  if (mimeExt) {
    return mimeExt;
  }

  let rawExtension = "";
  const filenameParts = file.name.split(".");

  if (filenameParts.length > 1) {
    rawExtension = filenameParts.pop() || "";
  }

  const finalExt = sanitize(rawExtension);

  return finalExt || "dat";
}

export function sanitizeFilename(str: string) {
  const reserved = /^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])$/i;

  let filename = str.replace(/\s+/g, "_");

  filename = filename.replace(/[<>:"/\\|?*\x00-\x1F\x7F]/g, "");

  filename = filename.replace(/^[.\s]+|[.\s]+$/g, "");

  const parts = filename.split(".");
  const nameOnly = parts.length > 1 ? parts.slice(0, -1).join(".") : filename;
  const ext = parts.length > 1 ? "." + parts[parts.length - 1] : "";

  if (reserved.test(nameOnly)) {
    filename = nameOnly + "_" + ext;
  }

  return filename || "unnamed";
}
