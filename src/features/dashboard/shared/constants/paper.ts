import type { PaperMapping } from "../types";

export const STANDARD_DPI = 96;

export const PAPER_SIZE_LABELS = [
  "letter",
  "long",
  "legal",
  "a4",
  "a5",
  "a3",
  "tabloid",
] as const;

export const PAPER_SIZE_MAP: PaperMapping = {
  letter: {
    label: "Letter (Short Bond)",
    labelSize: '8.5" x 11"',
    width: 8.5 * STANDARD_DPI,
    height: 11 * STANDARD_DPI,
  },
  long: {
    label: "Long (Philippine Legal/Folio)",
    labelSize: '8.5" x 13"',
    width: 8.5 * STANDARD_DPI,
    height: 13 * STANDARD_DPI,
  },
  legal: {
    label: "Legal (US Legal)",
    labelSize: '8.5" x 14"',
    width: 8.5 * STANDARD_DPI,
    height: 14 * STANDARD_DPI,
  },
  a4: {
    label: "A4",
    labelSize: '8.27" x 11.69"',
    width: 8.27 * STANDARD_DPI,
    height: 11.69 * STANDARD_DPI,
  },
  a5: {
    label: "A5",
    labelSize: '5.83" x 8.27"',
    width: 5.83 * STANDARD_DPI,
    height: 8.27 * STANDARD_DPI,
  },
  a3: {
    label: "A3",
    labelSize: '11.69" x 16.54"',
    width: 11.69 * STANDARD_DPI,
    height: 16.54 * STANDARD_DPI,
  },
  tabloid: {
    label: "Tabloid (Ledger)",
    labelSize: '11" x 17"',
    width: 11 * STANDARD_DPI,
    height: 17 * STANDARD_DPI,
  },
};
