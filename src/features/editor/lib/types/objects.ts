import type {
  ActiveSelection,
  Ellipse,
  FabricImage,
  FabricObject,
  FabricText,
  Line,
  Polygon,
  Rect,
  Triangle,
} from "fabric";
import type { LucideIcon } from "lucide-react";
import type { OBJECT_ALIGNMENTS } from "../constants";
import type { SHAPE_ITEMS } from "../constants/shapes";
import type { QRCode } from "../utils/extensions";

/* ------------------------------- Type Guards ------------------------------ */
export const isActiveSelection = (
  obj: FabricObject | null,
): obj is ActiveSelection => obj?.type?.toLowerCase() === "activeselection";

export const isEllipse = (obj: FabricObject | null): obj is Ellipse =>
  obj?.type?.toLowerCase() === "ellipse";

export const isLine = (obj: FabricObject | null): obj is Line =>
  obj?.type?.toLowerCase() === "line";

export const isPolygon = (obj: FabricObject | null): obj is Polygon =>
  obj?.type?.toLowerCase() === "polygon";

export const isPlaceholder = (obj: FabricObject | null): obj is Placeholder =>
  !!(obj as Placeholder)?.isPlaceholder;

export const isShape = (
  obj: FabricObject | null,
): obj is Rect | Ellipse | Triangle | Line | Polygon =>
  !!obj &&
  ["rect", "ellipse", "triangle", "line", "polygon"].includes(
    obj.type?.toLowerCase(),
  );

export const isText = (obj: FabricObject | null): obj is FabricText =>
  !!obj &&
  (isPlaceholder(obj) ||
    ["text", "textbox", "i-text"].includes(obj.type?.toLowerCase()));

export const isQR = (obj: FabricObject | null): obj is QRCode =>
  !!obj && isPlaceholder(obj) && obj.type?.toLowerCase() === "qrcode";

export const isImage = (obj: FabricObject | null): obj is FabricImage =>
  !!obj && obj.type?.toLowerCase() === "image";

export const isCustomPlaceholder = (
  obj: FabricObject | null,
): obj is Placeholder =>
  !!obj && isPlaceholder(obj) && obj.variant === "custom";

/* ---------------------------------- Text ---------------------------------- */
export type TextAlignment = "left" | "center" | "right" | "justify";
export type TextStyle = "bold" | "underline" | "italic" | "linethrough";

export interface AlignmentOption {
  value: TextAlignment;
  icon: LucideIcon;
}

export interface StyleOption {
  value: TextStyle;
  icon: LucideIcon;
}

/* ------------------------------ Shape Config ------------------------------ */
export type ShapeType = keyof typeof SHAPE_ITEMS;
export type ShapeObject = Rect | Ellipse | Triangle | Line | Polygon;

export type ShapeConstructor =
  | typeof Rect
  | typeof Ellipse
  | typeof Triangle
  | typeof Line
  | typeof Polygon;

export type ShapeConfig = {
  type: ShapeConstructor;
  width?: number;
  height?: number;
  radius?: number;
  rx?: number;
  ry?: number;
  points?: [number, number, number, number];
  strokeWidth?: number;
};

export interface CustomPolygon extends Polygon {
  polygonType?: "regular" | "star";
  sides?: number;
  starInset?: number;
  isPolygon?: boolean;
}

/* ------------------------------ Placeholders ------------------------------ */
export type PlaceholderVariant =
  | "recipient"
  | "qr-code"
  | "certificate-id"
  | "custom";

export type Placeholder = (FabricText | QRCode) & {
  isPlaceholder?: boolean;
  placeholderName?: string;
  variant: PlaceholderVariant;
  placeholderId: string;
};

export type ObjectPosition = (typeof OBJECT_ALIGNMENTS)[number]["position"];
