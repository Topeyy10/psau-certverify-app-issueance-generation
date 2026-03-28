import type { TextProps, TOptions } from "fabric";
import type { PlaceholderVariant } from "../types";
import type { QRProps } from "../utils/extensions";
import { OBJECT_SIZE } from "./shapes";
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
} from "./text";

export const PLACEHOLDER_CONFIG: TOptions<TextProps> = {
  textAlign: "center",
  fill: DEFAULT_FONT_COLOR,
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: DEFAULT_FONT_FAMILY,
};

export const QR_CODE_STYLE: TOptions<QRProps> = {
  backgroundColor: "#FFFFFF",
  fill: DEFAULT_FONT_COLOR,
  width: OBJECT_SIZE,
  height: OBJECT_SIZE,
  margin: 0,
};

export const QR_CODE_CONTROLS: Record<string, boolean> = {
  mt: false,
  mb: false,
  ml: false,
  mr: false,
};

export const VARIANT_CONFIG: Record<
  Exclude<PlaceholderVariant, "qr-code">,
  TOptions<TextProps>
> = {
  recipient: { text: "{{recipient}}", name: "Recipient" },
  "certificate-id": { text: "{{certificate-id}}", name: "Certificate ID" },
  custom: { text: "{{custom}}", name: "Custom" },
} as const;
