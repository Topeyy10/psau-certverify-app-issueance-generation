import axios from "axios";
import { ActiveSelection, type Canvas, Group } from "fabric";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { saveTemplate } from "@/aactions/template";
import { base64ToBlob } from "@/lib/utils";
import { useCanvasStore } from "../stores/canvas-store";
import { useTemplateStore } from "../stores/template-store";
import { isPlaceholder, type ObjectPosition, type SnapContext } from "../types";
import { getArtboardSnapshot } from "./artboard";
import { updateProperty } from "./shapes";
import { relativePanToKeepCenter } from "./viewport";

export const loadCanvasFromTemplate = async (
  canvas: Canvas,
  jsonId: string,
): Promise<void> => {
  try {
    const { data: templateData } = await axios.get(`/api/templates/id/${jsonId}`, {
      timeout: 10000,
    });
    // Fabric 6: loadFromJSON returns a Promise; the old callback was treated as a reviver, not onComplete.
    await canvas.loadFromJSON(templateData);
    canvas.renderAll();
  } catch (err: unknown) {
    const message =
      axios.isAxiosError(err) && err.response?.data
        ? String(err.response.data)
        : err instanceof Error
          ? err.message
          : "Failed to fetch template data";
    throw new Error(message);
  }
};

export const makeResizeHandler = (
  snapCtx: SnapContext,
  container: HTMLDivElement,
) => {
  const { canvas } = snapCtx;

  return () => {
    if (!container || !canvas.lowerCanvasEl) return;

    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;

    const prevWidth = canvas.getWidth();
    const prevHeight = canvas.getHeight();

    canvas.setDimensions({ width: newWidth, height: newHeight });
    relativePanToKeepCenter(canvas, prevWidth, prevHeight, newWidth, newHeight);
  };
};

/* ----------------------------- Object Actions ----------------------------- */
export const onDuplicateObject = async (offset = 15) => {
  const { canvas, objects } = useCanvasStore.getState();
  if (!canvas || !objects) return;

  const activeObjects = canvas.getActiveObjects();

  try {
    const clonedObjects = await Promise.all(
      activeObjects.map(async (obj) => {
        const clone = await obj.clone();

        if (isPlaceholder(clone)) {
          clone.placeholderId = uuidv4();
        }
        return clone;
      }),
    );

    // Single object case
    if (clonedObjects.length === 1) {
      const clone = clonedObjects[0];
      const { left = 0, top = 0 } = activeObjects[0];

      clone.set({
        left: left + offset,
        top: top + offset,
        originX: "center",
        originY: "center",
      });

      canvas.add(clone);
      canvas.discardActiveObject();
      canvas.setActiveObject(clone);
    }

    // Multiple object case
    else {
      const activeSelection = canvas.getActiveObject() as ActiveSelection;
      const groupLeft = activeSelection.left || 0;
      const groupTop = activeSelection.top || 0;

      clonedObjects.forEach((clone, index) => {
        const { left = 0, top = 0 } = activeObjects[index];

        clone.set({
          left: groupLeft + left + offset,
          top: groupTop + top + offset,
          originX: "center",
          originY: "center",
        });

        canvas.add(clone);
      });

      canvas.discardActiveObject();
      const newSelection = new ActiveSelection(clonedObjects, {
        canvas: canvas,
      });
      canvas.setActiveObject(newSelection);
    }
  } catch (err) {
    console.error("Cloning failed:", err);
  }
};

export const onDeleteObject = () => {
  const { canvas, objects } = useCanvasStore.getState();

  if (!canvas || !objects) return;

  const activeObjects = canvas.getActiveObjects();
  canvas.remove(...activeObjects);
  canvas.discardActiveObject();
};

/* --------------------------- Alignment Controls --------------------------- */
export const onAlignSingleObject = (position: ObjectPosition) => {
  const { canvas, artboard } = useCanvasStore.getState();

  if (!canvas || !artboard) return;

  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects) return;

  const obj = activeObjects[0];

  const artW = artboard.width ?? 0;
  const artH = artboard.height ?? 0;
  const artLeft = (artboard.left ?? 0) - artW / 2;
  const artTop = (artboard.top ?? 0) - artH / 2;

  const objW = obj.getScaledWidth();
  const objH = obj.getScaledHeight();

  const updates: { left?: number; top?: number } = {};

  switch (position) {
    case "left":
      updates.left = artLeft + objW / 2;
      break;
    case "center":
      updates.left = artLeft + artW / 2;
      break;
    case "right":
      updates.left = artLeft + artW - objW / 2;
      break;
    case "top":
      updates.top = artTop + objH / 2;
      break;
    case "middle":
      updates.top = artTop + artH / 2;
      break;
    case "bottom":
      updates.top = artTop + artH - objH / 2;
      break;
  }

  obj.set(updates).setCoords();
  canvas.requestRenderAll();
};

export const onAlignMultipleObject = (position: ObjectPosition) => {
  const { canvas, artboard } = useCanvasStore.getState();

  if (!canvas || !artboard) return;

  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects) return;

  const bounds = activeObjects.map((obj) => {
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    return {
      obj,
      left: obj.left! - w / 2,
      top: obj.top! - h / 2,
      right: obj.left! + w / 2,
      bottom: obj.top! + h / 2,
      centerX: obj.left!,
      centerY: obj.top!,
      w,
      h,
    };
  });

  switch (position) {
    case "left": {
      const minLeft = Math.min(...bounds.map((b) => b.left));
      bounds.forEach(({ obj, w }) => {
        obj.set({ left: minLeft + w / 2 }).setCoords();
      });
      break;
    }
    case "center": {
      const avgX =
        bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
      bounds.forEach(({ obj }) => {
        obj.set({ left: avgX }).setCoords();
      });
      break;
    }
    case "right": {
      const maxRight = Math.max(...bounds.map((b) => b.right));
      bounds.forEach(({ obj, w }) => {
        obj.set({ left: maxRight - w / 2 }).setCoords();
      });
      break;
    }
    case "top": {
      const minTop = Math.min(...bounds.map((b) => b.top));
      bounds.forEach(({ obj, h }) => {
        obj.set({ top: minTop + h / 2 }).setCoords();
      });
      break;
    }
    case "middle": {
      const avgY =
        bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;
      bounds.forEach(({ obj }) => {
        obj.set({ top: avgY }).setCoords();
      });
      break;
    }
    case "bottom": {
      const maxBottom = Math.max(...bounds.map((b) => b.bottom));
      bounds.forEach(({ obj, h }) => {
        obj.set({ top: maxBottom - h / 2 }).setCoords();
      });
      break;
    }
  }

  canvas.discardActiveObject();
  canvas.setActiveObject(
    new ActiveSelection(activeObjects, { canvas: canvas }),
  );
  canvas.requestRenderAll();
};

/* ----------------------------- Layer Controls ----------------------------- */
export const onLayerChange = (
  method:
    | "bringObjectForward"
    | "sendObjectBackwards"
    | "bringObjectToFront"
    | "sendObjectToBack",
) => {
  const { canvas } = useCanvasStore.getState();
  if (!canvas) return;

  const objects = canvas.getActiveObjects();
  if (!objects) return;

  for (const object of objects) {
    (canvas[method] as Function)(object);
  }
  canvas.renderAll();
};

/* --------------------------- Distribute Settngs --------------------------- */
export const onDistributeObjects = (direction: "horizontal" | "vertical") => {
  const { canvas } = useCanvasStore.getState();
  if (!canvas) return;

  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length < 3) return;

  const isHorizontal = direction === "horizontal";

  // Get bounding rectangles of each object (rotation-aware)
  const rects = activeObjects.map((obj) => ({
    obj,
    rect: obj.getBoundingRect(),
  }));

  // Sort objects left-to-right or top-to-bottom
  const sorted = rects.sort((a, b) =>
    isHorizontal ? a.rect.left - b.rect.left : a.rect.top - b.rect.top,
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Compute start and end of the full occupied span
  const start = isHorizontal ? first.rect.left : first.rect.top;
  const end = isHorizontal
    ? last.rect.left + last.rect.width
    : last.rect.top + last.rect.height;

  // Total size occupied by all objects (combined width or height)
  const totalSize = sorted.reduce(
    (sum, { rect }) => sum + (isHorizontal ? rect.width : rect.height),
    0,
  );

  // Available space to distribute between objects
  const availableSpace = end - start - totalSize;
  const gap = availableSpace / (sorted.length - 1); // Equal spacing

  let currentPos = start;

  for (let i = 0; i < sorted.length; i++) {
    const { obj, rect } = sorted[i];
    const size = isHorizontal ? rect.width : rect.height;

    // Do not move the first object
    if (i === 0) {
      currentPos += size + gap;
      continue;
    }

    // Do not move the last object
    if (i === sorted.length - 1) break;

    // Compute offset due to object transform (rotation/scale)
    const offset = isHorizontal ? rect.left - obj.left : rect.top - obj.top;

    // Update object position based on current gap
    if (isHorizontal) {
      obj.set({ left: currentPos - offset });
    } else {
      obj.set({ top: currentPos - offset });
    }

    obj.setCoords();
    currentPos += size + gap;
  }

  canvas.requestRenderAll();
};

/* -------------------------------- Grouping -------------------------------- */
export const groupObjects = () => {
  const { canvas } = useCanvasStore.getState();
  if (!canvas) return;
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length <= 1) return;

  // Group selected objects without moving them
  const group = new Group(activeObjects, {
    subTargetCheck: true,
  });

  // Remove individual objects from canvas and add the group
  activeObjects.forEach((obj) => {
    canvas.remove(obj);
  });
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
};

export const ungroupObjects = () => {
  const { canvas } = useCanvasStore.getState();
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();
  if (!(activeObject instanceof Group)) return;

  // Ungroup objects, preserving their positions
  const items = activeObject.removeAll();

  // Remove the empty group from canvas
  canvas.remove(activeObject);

  // Add ungrouped items back to canvas
  canvas.add(...items);

  // Create new active selection with ungrouped items
  const activeSelection = new ActiveSelection(items, { canvas });
  canvas.setActiveObject(activeSelection);
  canvas.requestRenderAll();
};

/* -------------------------------- Movement -------------------------------- */

/**
 * Move the active object in a given direction.
 * Uses useUpdateProperty to trigger reactive UI updates.
 */
export const onObjectMove = (
  direction: "left" | "right" | "top" | "down",
  skip: boolean = false,
  step: number = 2,
) => {
  const { canvas } = useCanvasStore.getState();
  if (!canvas) return;

  const activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  const moveFactor = skip ? step * 2 : 1;
  let property: "left" | "top";
  let delta: number;

  if (direction === "left" || direction === "right") {
    property = "left";
    delta = direction === "left" ? -step : step;
  } else {
    property = "top";
    delta = direction === "top" ? -step : step;
  }

  const current = activeObject[property] ?? 0;
  const newValue = current + delta * moveFactor;

  activeObject.set({ [property]: newValue }).setCoords();
  canvas.requestRenderAll();

  // update store (trigger reactivity)
  updateProperty(property, newValue);
};

const canvasToJSON = (canvas: Canvas) => {
  const clipPath = canvas.clipPath;
  canvas.clipPath = undefined;
  const json = canvas.toJSON();
  canvas.clipPath = clipPath;

  return json;
};

export const saveCanvas = async () => {
  const { canvas, artboard, setSaveStatus } = useCanvasStore.getState();
  const { name, size, meta, id, setId } = useTemplateStore.getState();

  if (!canvas || !artboard || !name || !size) return;
  const screenshotB64 = getArtboardSnapshot(canvas, artboard);

  const templateData = canvasToJSON(canvas);
  const jsonBlob = new Blob([JSON.stringify(templateData)], {
    type: "application/json",
  });

  const jsonFile = new File([jsonBlob], "template.json", {
    type: "application/json",
  });

  const imgBlob = base64ToBlob(screenshotB64, "image/jpeg");
  const screenshotFile = new File([imgBlob], "screenshot.jpg", {
    type: "image/jpeg",
  });

  const formData = new FormData();
  formData.append("jsonFile", jsonFile);
  formData.append("screenshot", screenshotFile);
  formData.append("name", name);
  formData.append("size", JSON.stringify(size));
  formData.append("isPortrait", JSON.stringify(meta?.isPortrait ?? ""));
  if (id) formData.append("templateId", id);

  try {
    setSaveStatus("saving");
    const res = await saveTemplate(formData);
    if (res.ok) {
      if (!id) {
        setId(res.id);
      }
      setSaveStatus("saved");
    } else {
      throw new Error("Error saving template");
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error occured. See console for more info";
    toast.error(message);

    console.error(error);
    setSaveStatus("unsaved");
  }
};
