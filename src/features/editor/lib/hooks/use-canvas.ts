import { Canvas, type Line, type Rect } from "fabric";
import { notFound } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useSettingsStore } from "@/features/settings";
import { useToastStore } from "@/stores/toast-store";
import { useCanvasStore } from "../stores/canvas-store";
import { useTemplateStore } from "../stores/template-store";
import type { SnapContext } from "../types";
import {
  applyDefaults,
  attachCanvasEvents,
  clipArtboard,
  createArtboard,
  findArtboardOrFallback,
  loadCanvasFromTemplate,
  protectArtboard,
  saveCanvas,
} from "../utils";

interface UseCanvas {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const useCanvas = (): UseCanvas => {
  const { size, name, jsonId } = useTemplateStore();

  const { stop, stopError } = useToastStore(
    useShallow((s) => ({ stop: s.stopSuccess, stopError: s.stopError })),
  );
  const { setCanvas, setArtboard, setInteractive } = useCanvasStore(
    useShallow((s) => ({
      setCanvas: s.setCanvas,
      setArtboard: s.setArtboard,
      setInteractive: s.setInteractive,
    })),
  );
  const isAutoSaving = useSettingsStore((s) => s.preferences.autoSave);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const snapLinesRef = useRef<Line[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Prevent double initialization
  const canvasInstanceRef = useRef<Canvas | null>(null);

  const setupCanvas = async (
    fabricCanvas: Canvas,
    container: HTMLDivElement,
  ) => {
    applyDefaults();

    let artboard: Rect;

    if (jsonId) {
      await loadCanvasFromTemplate(fabricCanvas, jsonId);

      const foundArtboard = findArtboardOrFallback(fabricCanvas);

      if (foundArtboard) {
        artboard = foundArtboard;
        protectArtboard(fabricCanvas, artboard);
        clipArtboard(fabricCanvas, artboard);
      } else {
        artboard = createArtboard(fabricCanvas, container, size);
      }
    } else {
      // New template
      artboard = createArtboard(fabricCanvas, container, size);
    }

    // Attach events after canvas and artboard exist
    const snapCtx: SnapContext = {
      canvas: fabricCanvas,
      artboard,
      snapLinesRef,
    };
    const cleanupEvents = attachCanvasEvents(fabricCanvas, container, snapCtx);

    // Update global store
    setCanvas(fabricCanvas);
    setArtboard(artboard);
    setInteractive(true);

    // Save cleanup function
    cleanupRef.current = () => {
      cleanupEvents();
      fabricCanvas.clear();
      fabricCanvas.dispose();
      setCanvas(null);
      setArtboard(null);
      canvasInstanceRef.current = null;
    };

    stop("Template loaded");
  };

  useEffect(() => {
    if (!name || !size) notFound();

    if (!canvasRef.current || !canvasContainerRef.current) {
      toast.error("Canvas failed to initialize, please try again.");
      return;
    }

    // Prevent double init
    if (canvasInstanceRef.current) return;

    // Clean up previous instance
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const container = canvasContainerRef.current;
    const fabricCanvas = new Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
    });

    // Ensure canvas has proper initial dimensions
    fabricCanvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    canvasInstanceRef.current = fabricCanvas;

    // Setup canvas safely
    setupCanvas(fabricCanvas, container).catch((error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load template, please try again.";
      stopError(message);
      setInteractive(false);
      if (fabricCanvas) {
        fabricCanvas.clear();
        fabricCanvas.dispose();
      }
      canvasInstanceRef.current = null;
    });

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) cleanupRef.current();
      canvasInstanceRef.current?.dispose();
      canvasInstanceRef.current = null;
    };
  }, [size, name, jsonId]);

  useEffect(() => {
    const canvas = canvasInstanceRef.current;
    if (!canvas || !isAutoSaving) return;

    const autoSaveInterval = setInterval(
      () => {
        saveCanvas().catch(console.error);
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [isAutoSaving]);

  return { canvasRef, canvasContainerRef };
};
