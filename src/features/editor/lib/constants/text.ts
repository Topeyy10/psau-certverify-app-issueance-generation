import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import type { AlignmentOption, StyleOption } from "../types/objects";

export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_FONT_COLOR = "#0f0f0f";
export const DEFAULT_TEXT_ALIGNMENT = "left";
export const DEFAULT_FONT_FAMILY = "Roboto";

export const ALIGNMENT_OPTIONS: readonly AlignmentOption[] = [
  { value: "left", icon: AlignLeftIcon },
  { value: "center", icon: AlignCenterIcon },
  { value: "right", icon: AlignRightIcon },
  { value: "justify", icon: AlignJustifyIcon },
] as const;

export const STYLE_OPTIONS: readonly StyleOption[] = [
  { value: "bold", icon: BoldIcon },
  { value: "underline", icon: UnderlineIcon },
  { value: "italic", icon: ItalicIcon },
  { value: "linethrough", icon: StrikethroughIcon },
] as const;
