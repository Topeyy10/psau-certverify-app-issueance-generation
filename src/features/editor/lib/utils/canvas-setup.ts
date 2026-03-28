import {
  BaseFabricObject,
  type Canvas,
  InteractiveFabricObject,
  type TPointerEventInfo,
} from "fabric";
import { createKeyboardShortcutListener, throttle } from "@/lib/utils";
import type { Shortcut } from "@/types";
import { useCanvasStore } from "../stores/canvas-store";
import type { FabricTransformEvent, SnapContext } from "../types";
import { makeSnapshotHandler } from "./artboard";
import {
  groupObjects,
  makeResizeHandler,
  onDeleteObject,
  onDuplicateObject,
  onLayerChange,
  onObjectMove,
  ungroupObjects,
} from "./canvas";
import "./extensions";
import { clearSnapLines, handleObjectMoving, snapToPosition } from "./snapping";

export const applyDefaults = () => {
  InteractiveFabricObject.ownDefaults = {
    ...InteractiveFabricObject.ownDefaults,
    cornerStyle: "circle",
    cornerColor: "#000",
    borderColor: "#000",
    cornerSize: 10,
    padding: 4,
    centeredRotation: true,
    borderDashArray: [5, 5],
    originX: "center",
    originY: "center",
    hoverCursor: "pointer",
    moveCursor: "move",
  };

  InteractiveFabricObject.customProperties = [
    "isPlaceholder",
    "placeholderName",
    "variant",
    "placeholderId",
    "polygonType",
    "variant",
    "sides",
    "isPolygon",
    "starInset",
    "isArtboard",
    "selectable",
    "evented",
  ];

  BaseFabricObject.ownDefaults = {
    ...BaseFabricObject.ownDefaults,
    originX: "center",
    originY: "center",
    strokeUniform: true,
  };

  BaseFabricObject.customProperties = [
    ...(BaseFabricObject.customProperties || []),
    "isArtboard",
  ];
};

const blockContextMenu = (container: HTMLDivElement) => {
  const handler = (e: MouseEvent) => {
    e.preventDefault();
    return false;
  };
  container.addEventListener("contextmenu", handler);
  return () => container.removeEventListener("contextmenu", handler);
};

const doubleClickListener = (e: TPointerEventInfo) => {
  const target = e.target;
  if (!target) return;
  if (!target.selectable) return;

  onLayerChange("bringObjectToFront");
};

const attachWindowListeners = (
  container: HTMLDivElement,
  snapCtx: SnapContext,
) => {
  // Canvas resize on browser resize
  const handleResize = makeResizeHandler(snapCtx, container);
  handleResize();

  // Block context menu on canvas
  const cleanupContextMenu = blockContextMenu(container);

  // --- Register listeners ---
  window.addEventListener("resize", handleResize);

  const shortcutDefinitions: Shortcut[] = [
    // --- Correctly Defined Shortcuts (No Change Needed) ---
    { key: "Delete", fn: onDeleteObject },
    // Use an arrow function for Ctrl+D because you need to *call* onDuplicateObject()
    { key: "d", hasCtrl: true, fn: () => onDuplicateObject() },
    { key: "g", hasCtrl: true, fn: groupObjects },
    { key: "g", hasShift: true, hasCtrl: true, fn: ungroupObjects },

    // --- Corrected Movement Shortcuts (Direct Function Reference) ---
    // 🟢 CORRECT: The function that runs on keydown IS the throttled function
    { key: "ArrowLeft", fn: () => onObjectMove("left") },
    { key: "ArrowUp", fn: () => onObjectMove("top") },
    { key: "ArrowRight", fn: () => onObjectMove("right") },
    { key: "ArrowDown", fn: () => onObjectMove("down") },

    { key: "ArrowLeft", hasShift: true, fn: () => onObjectMove("left", true) },
    { key: "ArrowUp", hasShift: true, fn: () => onObjectMove("top", true) },
    {
      key: "ArrowRight",
      hasShift: true,
      fn: () => onObjectMove("right", true),
    },
    { key: "ArrowDown", hasShift: true, fn: () => onObjectMove("down", true) },
  ];

  const cleanupShortcuts = createKeyboardShortcutListener(shortcutDefinitions);

  return () => {
    cleanupContextMenu();
    cleanupShortcuts();
    window.removeEventListener("resize", handleResize);
  };
};

export const attachCanvasEvents = (
  canvas: Canvas,
  container: HTMLDivElement,
  snapCtx: SnapContext,
) => {
  const { setObjects, setArtboardPreview, artboard, setSaveStatus } =
    useCanvasStore.getState();

  const throttleSetObjects = throttle(() => {
    setObjects(canvas.getActiveObject() ?? null);
    setSaveStatus("unsaved");
  }, 100);

  const cleanupWindowEvent = attachWindowListeners(container, snapCtx);

  // Handle artboard snapshot
  const getArtboardSnapshot = makeSnapshotHandler(
    canvas,
    snapCtx.artboard,
    setArtboardPreview,
  );
  getArtboardSnapshot();

  // Selection handlers
  const handleSelectionCreated = () => {
    throttleSetObjects();
  };
  const handleSelectionUpdated = () => {
    throttleSetObjects();
  };
  const handleSelectionCleared = () => {
    setObjects(null);
    getArtboardSnapshot();
    clearSnapLines(canvas, snapCtx);
  };

  const handleObjectScaling = () => {
    throttleSetObjects();
  };

  const handleObjectRotating = () => {
    throttleSetObjects();
  };

  // Movement + snap handlers
  const onObjectMoving = (e: unknown) => {
    const evt = e as FabricTransformEvent;
    handleObjectMoving(snapCtx, evt);
    throttleSetObjects();
  };

  const handleLayerRender = () => {
    if (!artboard) return;

    const objects = canvas.getObjects();
    if (objects.indexOf(artboard) !== 0) {
      canvas.moveObjectTo(artboard, 0);
    }
  };

  const onObjectModifiedSnap = (e: unknown) => {
    snapToPosition(snapCtx, e as FabricTransformEvent);
    throttleSetObjects();
    handleLayerRender();
  };

  // Mouse up => clear lines soon after
  const onMouseUp = () => setTimeout(() => clearSnapLines(canvas, snapCtx), 50);

  canvas.on("object:moving", onObjectMoving);
  canvas.on("object:modified", onObjectModifiedSnap);

  canvas.on("object:scaling", handleObjectScaling);
  canvas.on("object:rotating", handleObjectRotating);

  canvas.on("selection:created", handleSelectionCreated);
  canvas.on("selection:updated", handleSelectionUpdated);
  canvas.on("selection:cleared", handleSelectionCleared);

  canvas.on("mouse:up", onMouseUp);

  canvas.on("mouse:dblclick", doubleClickListener);

  // --- Return cleanup ---
  return () => {
    cleanupWindowEvent();

    canvas.off("object:moving", onObjectMoving);
    canvas.off("object:modified", onObjectModifiedSnap);

    canvas.off("object:scaling", handleObjectScaling);
    canvas.off("object:rotating", handleObjectRotating);

    canvas.off("object:added", getArtboardSnapshot);
    canvas.off("object:removed", getArtboardSnapshot);
    canvas.off("object:modified", getArtboardSnapshot);

    canvas.off("selection:created", handleSelectionCreated);
    canvas.off("selection:updated", handleSelectionUpdated);
    canvas.off("selection:cleared", handleSelectionCleared);

    canvas.off("mouse:up", onMouseUp);

    canvas.off("mouse:dblclick", doubleClickListener);

    clearSnapLines(canvas, snapCtx);
    setObjects(null);
    setArtboardPreview(null);
    setSaveStatus("unsaved");
  };
};
