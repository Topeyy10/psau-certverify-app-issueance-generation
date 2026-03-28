import { type Canvas, Point, type Rect } from "fabric";

/**
 * Absolutely centers the artboard in the canvas and applies a given zoom level.
 * Used when resetting the viewport (e.g. "Reset Zoom").
 */
export const resetViewportToArtboard = (
  canvas: Canvas,
  artboard: Rect,
  zoom: number = 1,
) => {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  const artboardLeft = artboard.left ?? 0;
  const artboardTop = artboard.top ?? 0;

  const offsetX = canvasWidth / 2 - artboardLeft * zoom;
  const offsetY = canvasHeight / 2 - artboardTop * zoom;

  canvas.setViewportTransform([zoom, 0, 0, zoom, offsetX, offsetY]);
  canvas.requestRenderAll();
};

/**
 * Keeps the visual center stable when resizing the canvas.
 * Used in window resize handlers, so the viewport doesn’t "jump".
 */
export const relativePanToKeepCenter = (
  canvas: Canvas,
  prevWidth: number,
  prevHeight: number,
  newWidth: number,
  newHeight: number,
) => {
  const dx = (newWidth - prevWidth) / 2;
  const dy = (newHeight - prevHeight) / 2;

  canvas.relativePan(new Point(dx, dy));
  canvas.requestRenderAll();
};
