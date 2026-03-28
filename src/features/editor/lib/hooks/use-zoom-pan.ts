import { Point } from "fabric";
import { useCallback, useEffect, useState } from "react";
import { useCanvasStore } from "../stores/canvas-store";
import { resetViewportToArtboard } from "../utils";

interface UseZoomPan {
  /** Current zoom level state */
  zoom: number;
  /**
   * Programmatically zooms in by configured step amount.
   * Zooms toward canvas center point.
   */
  zoomIn: () => void;
  /**
   * Programmatically zooms out by configured step amount.
   * Zooms from canvas center point.
   */
  zoomOut: () => void;
  /**
   * Resets zoom level to 100% and centers the artboard in viewport.
   * Uses utility function to handle viewport positioning.
   */
  resetZoom: () => void;
}

/**
 * Configuration options for zoom and pan functionality.
 */
interface UseZoomPanOptions {
  /** Minimum zoom level @default 0.2 */
  zoomMin?: number;
  /** Maximum zoom level @default 5 */
  zoomMax?: number;
  /** Zoom increment/decrement step @default 0.1 */
  zoomStep?: number;
}

/**
 * Custom hook for managing canvas zoom and pan interactions.
 *
 * Provides mouse wheel zooming, trackpad panning, middle-click drag panning,
 * and programmatic zoom controls with configurable limits and steps.
 *
 * @param {UseZoomPanOptions} options - Configuration options for zoom behavior
 * @param {number} [options.zoomMin=0.2] - Minimum allowed zoom level
 * @param {number} [options.zoomMax=5] - Maximum allowed zoom level
 * @param {number} [options.zoomStep=0.1] - Step size for zoom in/out operations
 *
 * @returns {Object} Zoom control interface
 * @returns {number} returns.zoom - Current zoom level as percentage (e.g., 100 for 100%)
 * @returns {Function} returns.zoomIn - Function to zoom in by one step
 * @returns {Function} returns.zoomOut - Function to zoom out by one step
 * @returns {Function} returns.resetZoom - Function to reset zoom to 100% and center artboard
 *
 * @example
 * ```tsx
 * function ZoomControls() {
 *   const { zoom, zoomIn, zoomOut, resetZoom } = useZoomPan({
 *     zoomMin: 0.1,
 *     zoomMax: 10,
 *     zoomStep: 0.2
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={zoomIn}>Zoom In</button>
 *       <span>{zoom}%</span>
 *       <button onClick={zoomOut}>Zoom Out</button>
 *       <button onClick={resetZoom}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useZoomPan = ({
  zoomMin = 0.2,
  zoomMax = 5,
  zoomStep = 0.1,
}: UseZoomPanOptions = {}): UseZoomPan => {
  const canvas = useCanvasStore((s) => s.canvas);
  const artboard = useCanvasStore((s) => s.artboard);

  /**
   * Clamps zoom value within configured minimum and maximum bounds.
   * @param {number} value - Zoom value to clamp
   * @returns {number} Clamped zoom value
   */
  const clampZoom = useCallback(
    (value: number) => Math.min(Math.max(value, zoomMin), zoomMax),
    [zoomMin, zoomMax],
  );

  /** Current zoom level state */
  const [zoom, setZoom] = useState(1);

  /**
   * Handles mouse wheel events for zooming and panning.
   * - Ctrl/Cmd + wheel: Zoom in/out at pointer position
   * - Wheel without modifiers: Pan canvas (trackpad scroll)
   */
  const handleWheel = useCallback(
    (opt: any) => {
      if (!canvas) return;
      const e = opt.e as WheelEvent;
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zooming with modifier key held
        const newZoom = clampZoom(canvas.getZoom() * 0.999 ** e.deltaY);
        canvas.zoomToPoint(new Point(opt.pointer.x, opt.pointer.y), newZoom);
        setZoom(newZoom);
      } else {
        // Panning with trackpad scroll
        canvas.relativePan(new Point(-e.deltaX, -e.deltaY));
        canvas.requestRenderAll();
      }
    },
    [canvas, clampZoom],
  );

  useEffect(() => {
    if (!canvas) return;

    /** Flag to track middle mouse button drag state */
    let isDragging = false;
    /** Last recorded X position for drag calculation */
    let lastPosX = 0;
    /** Last recorded Y position for drag calculation */
    let lastPosY = 0;

    /**
     * Initiates pan drag on middle mouse button press.
     * Disables object selection during drag operation.
     */
    const handleMouseDown = (opt: any) => {
      const e = opt.e as MouseEvent;
      if (e.button !== 1) return; // Only respond to middle mouse button
      isDragging = true;
      canvas.setCursor("grabbing");
      canvas.selection = false; // Disable object selection during pan
      lastPosX = e.clientX;
      lastPosY = e.clientY;
    };

    /**
     * Handles mouse movement during pan drag operation.
     * Calculates delta movement and applies relative pan.
     */
    const handleMouseMove = (opt: any) => {
      if (!isDragging) return;
      const e = opt.e as MouseEvent;
      const dx = e.clientX - lastPosX;
      const dy = e.clientY - lastPosY;
      canvas.relativePan(new Point(dx, dy));
      lastPosX = e.clientX;
      lastPosY = e.clientY;
      canvas.requestRenderAll();
    };

    /**
     * Ends pan drag operation and restores normal canvas behavior.
     * Re-enables object selection and resets cursor.
     */
    const handleMouseUp = () => {
      isDragging = false;
      canvas.setCursor("default");
      canvas.selection = true; // Re-enable object selection
    };

    // Attach event listeners
    canvas.on("mouse:wheel", handleWheel);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    // Cleanup event listeners
    return () => {
      canvas.off("mouse:wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, handleWheel]);

  /**
   * Programmatically zooms in by configured step amount.
   * Zooms toward canvas center point.
   */
  const zoomIn = useCallback(() => {
    if (!canvas) return;
    const newZoom = clampZoom(canvas.getZoom() + zoomStep);
    canvas.zoomToPoint(canvas.getCenterPoint(), newZoom);
    setZoom(newZoom);
  }, [canvas, zoomStep, clampZoom]);

  /**
   * Programmatically zooms out by configured step amount.
   * Zooms from canvas center point.
   */
  const zoomOut = useCallback(() => {
    if (!canvas) return;
    const newZoom = clampZoom(canvas.getZoom() - zoomStep);
    canvas.zoomToPoint(canvas.getCenterPoint(), newZoom);
    setZoom(newZoom);
  }, [canvas, zoomStep, clampZoom]);

  /**
   * Resets zoom level to 100% and centers the artboard in viewport.
   * Uses utility function to handle viewport positioning.
   */
  const resetZoom = useCallback(() => {
    if (!canvas || !artboard) return;
    resetViewportToArtboard(canvas, artboard, 1);
    setZoom(1);
  }, [canvas, artboard]);

  return {
    /** Current zoom level as percentage */
    zoom: Math.round(zoom * 100),
    zoomIn,
    zoomOut,
    resetZoom,
  };
};
