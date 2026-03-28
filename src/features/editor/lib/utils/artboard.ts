import { type Canvas, type FabricObject, Rect } from "fabric";
import { useSettingsStore } from "@/features/settings/";
import { useCanvasStore } from "../stores/canvas-store";
import type { Artboard, TemplateState } from "../types";

export const createArtboard = (
  canvas: Canvas,
  container: HTMLDivElement,
  size: TemplateState["size"],
): Rect => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const artboardWidth = (size?.w ?? 0) / 2;
  const artboardHeight = (size?.h ?? 0) / 2;

  const artboard = new Rect({
    originX: "center",
    originY: "center",
    top: height / 2,
    left: width / 2,
    width: artboardWidth,
    height: artboardHeight,
    fill: "#ffffff",
    selectable: false,
    evented: false,
  });

  (artboard as Artboard).isArtboard = true;

  canvas.add(artboard);
  protectArtboard(canvas, artboard);
  clipArtboard(canvas, artboard);

  return artboard;
};

export const clipArtboard = (canvas: Canvas, artboard: Rect) => {
  const { preferences } = useSettingsStore.getState();
  const clipArtboard = preferences.autoClipToArtboard;

  if (clipArtboard) {
    canvas.clipPath = new Rect({
      left: artboard.left ?? 0,
      top: artboard.top ?? 0,
      width: artboard.width ?? 0,
      height: artboard.height ?? 0,
      absolutePositioned: false,
    });
  }
};

export const protectArtboard = (canvas: Canvas, artboard: Rect) => {
  const originalSendToBack = canvas.sendObjectToBack.bind(canvas);
  const originalSendBackwards = canvas.sendObjectBackwards.bind(canvas);

  canvas.sendObjectToBack = function (object) {
    if (object === artboard) return true;
    const result = originalSendToBack(object);
    // Keep artboard at bottom if it got displaced
    const objects = this.getObjects();
    if (objects[0] !== artboard) {
      this.moveObjectTo(artboard, 0);
    }
    return result;
  };

  canvas.sendObjectBackwards = function (object) {
    if (object === artboard) return true;
    const objects = this.getObjects();
    const objectIndex = objects.indexOf(object);
    const artboardIndex = objects.indexOf(artboard);

    // Don't move if it would go behind artboard
    if (objectIndex <= artboardIndex + 1) return true;

    return originalSendBackwards(object);
  };
};

export const makeSnapshotHandler =
  (
    canvas: Canvas,
    artboard: Rect,
    setArtboardPreview: (data: string) => void,
  ) =>
  () => {
    const artboardLeft = artboard.left! - artboard.width! / 2;
    const artboardTop = artboard.top! - artboard.height! / 2;

    const originalVpt = canvas.viewportTransform;
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

    const snapshot = canvas.toDataURL({
      format: "jpeg",
      left: artboardLeft,
      top: artboardTop,
      width: artboard.width,
      height: artboard.height,
      multiplier: 0.5,
      quality: 0.8,
      enableRetinaScaling: false,
    });

    canvas.viewportTransform = originalVpt;
    canvas.requestRenderAll();
    setArtboardPreview(snapshot);
  };

export const getArtboardSnapshot = (canvas: Canvas, artboard: Rect) => {
  const artboardLeft = artboard.left! - artboard.width! / 2;
  const artboardTop = artboard.top! - artboard.height! / 2;

  const originalVpt = canvas.viewportTransform;
  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

  const snapshot = canvas.toDataURL({
    format: "jpeg",
    left: artboardLeft,
    top: artboardTop,
    width: artboard.width,
    height: artboard.height,
    multiplier: 1.5,
    quality: 1,
    enableRetinaScaling: false,
  });

  canvas.viewportTransform = originalVpt;
  canvas.requestRenderAll();

  return snapshot;
};

export const getArtboardCenterPoint = (artboard: Rect) => {
  const center = artboard.getCenterPoint();
  const x = center.x - (artboard.left ?? 0);
  const y = center.y - (artboard.top ?? 0);

  return { x, y };
};

export const addToArtboard = (
  object: FabricObject,
  artboard: Rect,
  canvas: Canvas,
  offsetX: number,
  offsetY: number,
) => {
  const artboardLeft = artboard.left ?? 0;
  const artboardTop = artboard.top ?? 0;
  object.set({
    left: artboardLeft + offsetX,
    top: artboardTop + offsetY,
  });

  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
};

export const toArtboardCoord = (coords: "left" | "top", value: number) => {
  const { artboard } = useCanvasStore.getState();
  if (!artboard) return value;

  switch (coords) {
    case "left": {
      const artboardLeft =
        artboard.left - (artboard.width * artboard.scaleX) / 2;
      return Math.round(value - artboardLeft);
    }
    case "top": {
      const artboardTop =
        artboard.top - (artboard.height * artboard.scaleY) / 2;
      return Math.round(value - artboardTop);
    }
    default:
      return Math.round(value);
  }
};

export const toCanvasCoord = (coords: "left" | "top", value: number) => {
  const { artboard } = useCanvasStore.getState();
  if (!artboard) return value;

  switch (coords) {
    case "left": {
      const artboardLeft =
        artboard.left - (artboard.width * artboard.scaleX) / 2;
      return Math.round(value + artboardLeft);
    }
    case "top": {
      const artboardTop =
        artboard.top - (artboard.height * artboard.scaleY) / 2;
      return Math.round(value + artboardTop);
    }
    default:
      return Math.round(value);
  }
};
