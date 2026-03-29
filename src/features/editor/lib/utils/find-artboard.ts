import type { Canvas, Rect } from "fabric";
import type { Artboard } from "../types";

/**
 * Finds the certificate artboard rect. Templates should set `isArtboard` on the
 * white background rect; older JSON may omit it — then we use the first rect
 * (editor keeps the artboard at the bottom = index 0 in stacking order).
 */
export function findArtboardOrFallback(canvas: Canvas): Rect | null {
  const objects = canvas.getObjects();

  const marked = objects.find(
    (obj) =>
      obj.type.toLowerCase() === "rect" && (obj as Artboard).isArtboard,
  ) as Rect | undefined;

  if (marked) return marked;

  const bottom = objects[0];
  if (bottom && bottom.type.toLowerCase() === "rect") {
    const rect = bottom as Rect;
    (rect as Artboard).isArtboard = true;
    return rect;
  }

  const anyRect = objects.find(
    (obj) => obj.type.toLowerCase() === "rect",
  ) as Rect | undefined;

  if (anyRect) {
    (anyRect as Artboard).isArtboard = true;
    return anyRect;
  }

  return null;
}
