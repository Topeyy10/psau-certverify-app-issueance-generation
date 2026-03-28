import { type Canvas, type FabricObject, Line } from "fabric";
import {
  SNAP_DISTANCE,
  SNAP_LINE_COLOR,
  SNAP_LINE_DASHED_ARRAY,
  SNAP_LINE_OFFSET,
  SNAP_LINE_WIDTH,
} from "../constants/snapping";
import type { FabricTransformEvent, SnapContext, SnapLine } from "../types";

/**
 * Creates a snap line for visual alignment assistance in the editor.
 *
 * @param x1 - The x-coordinate of the starting point of the line.
 * @param y1 - The y-coordinate of the starting point of the line.
 * @param x2 - The x-coordinate of the ending point of the line.
 * @param y2 - The y-coordinate of the ending point of the line.
 * @returns A `Line` object configured as a non-selectable, dashed snap line, excluded from export.
 */
const createSnapLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): SnapLine =>
  new Line([x1, y1, x2, y2], {
    stroke: SNAP_LINE_COLOR,
    strokeWidth: SNAP_LINE_WIDTH,
    strokeDashArray: SNAP_LINE_DASHED_ARRAY,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    isSnapline: true,
  }) as SnapLine;

/**
 * Removes all snap lines from the canvas and clears the snap lines reference.
 * After removing the lines, it requests the canvas to re-render.
 *
 * @param canvas - The canvas instance from which snap lines will be removed.
 * @param snapCtx - The snapping context containing a reference to the current snap lines.
 */
export const clearSnapLines = (canvas: Canvas, snapCtx: SnapContext) => {
  snapCtx.snapLinesRef.current.forEach((line) => {
    canvas.remove(line);
  });
  snapCtx.snapLinesRef.current = [];
  canvas.requestRenderAll();
};

/**
 * Displays snap lines on the canvas based on the provided snap line definitions.
 *
 * This function first clears any existing snap lines, then calculates the visible
 * area of the canvas considering the current zoom and viewport transform. For each
 * snap line definition, it creates a vertical or horizontal snap line as appropriate,
 * adds it to the canvas, and tracks it in the snap context.
 *
 * @param canvas - The Fabric.js canvas instance where snap lines will be rendered.
 * @param snapCtx - The snapping context containing references for managing snap lines.
 * @param lines - An array of snap line definitions specifying position and orientation.
 */
export const showSnapLines = (
  canvas: Canvas,
  snapCtx: SnapContext,
  lines: SnapLine[],
) => {
  clearSnapLines(canvas, snapCtx);

  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform!;
  const visibleLeft = -vpt[4] / zoom;
  const visibleTop = -vpt[5] / zoom;
  const visibleRight = visibleLeft + canvas.getWidth() / zoom;
  const visibleBottom = visibleTop + canvas.getHeight() / zoom;

  lines.forEach((line) => {
    let snapLine: Line | null = null;

    if (line.isVertical && line.x !== undefined) {
      snapLine = createSnapLine(
        line.x,
        visibleTop,
        line.x,
        visibleBottom,
      ) as Line;
    } else if (!line.isVertical && line.y !== undefined) {
      snapLine = createSnapLine(
        visibleLeft,
        line.y,
        visibleRight,
        line.y,
      ) as Line;
    }

    if (snapLine) {
      canvas.add(snapLine);
      snapCtx.snapLinesRef.current.push(snapLine);
    }
  });

  canvas.requestRenderAll();
};

/**
 * Handles the snapping logic when an object is moved on the canvas.
 *
 * This function acts as a listener for object movement events. When an object is moved
 * near the edges, corners, or center of the artboard, it calculates the proximity and
 * displays snap lines to assist with alignment. If the object is not near any snap points,
 * it clears any existing snap lines.
 *
 * @param snapCtx - The snapping context containing references to the artboard and canvas.
 * @param e - The fabric transformation event triggered by object movement.
 */
export const handleObjectMoving = (
  snapCtx: SnapContext,
  e: FabricTransformEvent,
) => {
  const { artboard, canvas } = snapCtx;
  const obj = e.target as FabricObject;
  if (!obj || obj === artboard) return;

  const artboardBounds = artboard.getBoundingRect();
  const artboardCenter = {
    x: artboardBounds.left + artboardBounds.width / 2,
    y: artboardBounds.top + artboardBounds.height / 2,
  };

  const objBounds = obj.getBoundingRect();
  const objCenter = {
    x: objBounds.left + objBounds.width / 2,
    y: objBounds.top + objBounds.height / 2,
  };

  const snapLines: SnapLine[] = [];

  // Center snapping lines
  if (Math.abs(objCenter.x - artboardCenter.x) < SNAP_DISTANCE)
    snapLines.push({ x: artboardCenter.x, isVertical: true });

  if (Math.abs(objCenter.y - artboardCenter.y) < SNAP_DISTANCE)
    snapLines.push({ y: artboardCenter.y, isVertical: false });

  // Edge snapping lines (offset inward so they're visible)
  if (Math.abs(objBounds.left - artboardBounds.left) < SNAP_DISTANCE)
    snapLines.push({
      x: artboardBounds.left + SNAP_LINE_OFFSET,
      isVertical: true,
    });

  if (
    Math.abs(
      objBounds.left +
        objBounds.width -
        (artboardBounds.left + artboardBounds.width),
    ) < SNAP_DISTANCE
  ) {
    snapLines.push({
      x: artboardBounds.left + artboardBounds.width - SNAP_LINE_OFFSET,
      isVertical: true,
    });
  }

  if (Math.abs(objBounds.top - artboardBounds.top) < SNAP_DISTANCE)
    snapLines.push({
      y: artboardBounds.top + SNAP_LINE_OFFSET,
      isVertical: false,
    });

  if (
    Math.abs(
      objBounds.top +
        objBounds.height -
        (artboardBounds.top + artboardBounds.height),
    ) < SNAP_DISTANCE
  ) {
    snapLines.push({
      y: artboardBounds.top + artboardBounds.height - SNAP_LINE_OFFSET,
      isVertical: false,
    });
  }

  if (snapLines.length > 0) showSnapLines(canvas, snapCtx, snapLines);
  else clearSnapLines(canvas, snapCtx);
};

// Apply snapping once movement finishes
/**
 * Snaps a fabric object to the nearest artboard position (center, edge, or corner) if it is within a defined snapping distance.
 *
 * This function is triggered when the user finishes moving an object (e.g., on mouse release).
 * It checks if the object's center or edges are close enough to the artboard's center or edges,
 * and if so, adjusts the object's position to align it precisely with the snap line.
 *
 * After snapping, the object's coordinates are updated and the canvas is re-rendered.
 * Snap lines are cleared shortly after to provide visual feedback.
 *
 * @param snapCtx - The snapping context containing the artboard and canvas references.
 * @param e - The fabric transform event containing the target object being moved.
 */
export const snapToPosition = (
  snapCtx: SnapContext,
  e: FabricTransformEvent,
) => {
  const { artboard, canvas } = snapCtx;
  const obj = e.target as FabricObject;
  if (!obj || obj === artboard) return;

  const artboardBounds = artboard.getBoundingRect();
  const artboardCenter = {
    x: artboardBounds.left + artboardBounds.width / 2,
    y: artboardBounds.top + artboardBounds.height / 2,
  };

  const objBounds = obj.getBoundingRect();
  const objCenter = {
    x: objBounds.left + objBounds.width / 2,
    y: objBounds.top + objBounds.height / 2,
  };

  let snapped = false;
  let newLeft = obj.left ?? 0;
  let newTop = obj.top ?? 0;

  // Center snaps
  if (Math.abs(objCenter.x - artboardCenter.x) < SNAP_DISTANCE) {
    newLeft += artboardCenter.x - objCenter.x;
    snapped = true;
  }
  if (Math.abs(objCenter.y - artboardCenter.y) < SNAP_DISTANCE) {
    newTop += artboardCenter.y - objCenter.y;
    snapped = true;
  }

  // Edge snaps (preserve your else-if so both sides don’t apply at once)
  if (Math.abs(objBounds.left - artboardBounds.left) < SNAP_DISTANCE) {
    newLeft += artboardBounds.left - objBounds.left;
    snapped = true;
  } else if (
    Math.abs(
      objBounds.left +
        objBounds.width -
        (artboardBounds.left + artboardBounds.width),
    ) < SNAP_DISTANCE
  ) {
    newLeft +=
      artboardBounds.left +
      artboardBounds.width -
      (objBounds.left + objBounds.width);
    snapped = true;
  }

  if (Math.abs(objBounds.top - artboardBounds.top) < SNAP_DISTANCE) {
    newTop += artboardBounds.top - objBounds.top;
    snapped = true;
  } else if (
    Math.abs(
      objBounds.top +
        objBounds.height -
        (artboardBounds.top + artboardBounds.height),
    ) < SNAP_DISTANCE
  ) {
    newTop +=
      artboardBounds.top +
      artboardBounds.height -
      (objBounds.top + objBounds.height);
    snapped = true;
  }

  if (snapped) {
    obj.set({ left: newLeft, top: newTop });
    obj.setCoords();
    canvas.requestRenderAll();
  }

  setTimeout(() => clearSnapLines(canvas, snapCtx), 100);
};
