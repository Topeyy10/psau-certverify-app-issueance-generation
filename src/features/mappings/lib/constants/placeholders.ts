import type { Placeholder } from "../types";

export const META_PLACEHOLDERS: readonly Placeholder[] = Object.freeze([
  {
    key: "recipientName",
    label: "Recipient Name",
    mappable: true,
    isMeta: true,
    isCustom: false,
  },
  {
    key: "recipientEmail",
    label: "Recipient Email",
    mappable: true,
    isMeta: true,
    isCustom: false,
  },
] as const);

export const NON_MAPPABLE_VARIANTS = new Set(["qr-code", "certificate-id"]);
