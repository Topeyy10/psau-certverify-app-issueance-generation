import type { PAPER_SIZE_LABELS } from "../constants/paper";

export type Paper = {
  label: string;
  labelSize: string;
  width: number;
  height: number;
};

export type PaperMapping = Record<(typeof PAPER_SIZE_LABELS)[number], Paper>;
