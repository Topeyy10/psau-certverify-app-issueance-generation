import { FabricImage, Textbox } from "fabric";
import { type RefObject, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGNMENT,
} from "../constants/text";
import { useCanvasStore } from "../stores/canvas-store";
import type { PlaceholderVariant, ShapeType } from "../types";
import {
  addToArtboard,
  createPlaceholder,
  createShape,
  getArtboardCenterPoint,
} from "../utils";

interface UseTools {
  /** Function to add editable text to canvas */
  handleAddText: () => void;
  /** Function to add shapes by type */
  handleAddShape: (shape: ShapeType) => void;
  /** Function to add placeholders by variant */
  handleAddPlaceholder: (variant: PlaceholderVariant) => void;
  /** Function add image to canvas */
  handleAddImage: () => void;
  imageFileRef: RefObject<HTMLInputElement | null>;
}

/**
 * Custom hook for managing canvas tool operations.
 *
 * Provides functions for adding text elements, shapes, and placeholders to the canvas.
 * Handles canvas and artboard reference validation, positioning, and error management.
 * All elements are automatically positioned at the artboard center.
 *
 * @returns {Object} Tool handler functions
 * @returns {Function} returns.handleAddText - Function to add editable text to canvas
 * @returns {Function} returns.handleAddShape - Function to add shapes by type
 * @returns {Function} returns.handleAddPlaceholder - Function to add placeholders by variant
 *
 * @example
 * ```tsx
 * function ToolbarComponent() {
 *   const { handleAddText, handleAddShape, handleAddPlaceholder } = useTools();
 *
 *   return (
 *     <div>
 *       <button onClick={handleAddText}>Add Text</button>
 *       <button onClick={() => handleAddShape('ellipse')}>Add Rectangle</button>
 *       <button onClick={() => handleAddPlaceholder('recipient')}>Add Placeholder</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useTools = (): UseTools => {
  /** Canvas and artboard references from store with shallow comparison */
  const { canvas, artboard } = useCanvasStore(
    useShallow((s) => ({ canvas: s.canvas, artboard: s.artboard })),
  );

  /** Reference for the hidden image file input */
  const imageFileRef = useRef<HTMLInputElement>(null);

  /**
   * Validates canvas and artboard references are available.
   * Provides type-safe access to canvas operations.
   *
   * @returns {Object} Validation result with canvas references
   * @returns {false} returns.ok - When references are unavailable
   * @returns {true} returns.ok - When references are available
   * @returns {Canvas} returns.canvas - Fabric.js canvas instance (when ok: true)
   * @returns {Object} returns.artboard - Artboard object (when ok: true)
   */
  const ensureRefs = useCallback(() => {
    if (!canvas || !artboard) {
      return { ok: false as const };
    }

    return { ok: true as const, canvas, artboard };
  }, [canvas, artboard]);

  /**
   * Adds an editable text element to the canvas center.
   *
   * Creates a Textbox with default styling and immediately enters edit mode.
   * Automatically removes empty text elements when editing is completed.
   * Text width is constrained to 80% of artboard width for responsive design.
   */
  const handleAddText = useCallback(() => {
    const { ok, canvas, artboard } = ensureRefs();
    if (!ok) return;

    /** Calculate center position of artboard */
    const { x, y } = getArtboardCenterPoint(artboard);
    /** Set text width to 80% of artboard for optimal layout */
    const visibleWidth = (artboard.width ?? 20) * 0.8;

    // Create textbox with default configuration
    const textbox = new Textbox("Double click to edit text", {
      fill: DEFAULT_FONT_COLOR,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: DEFAULT_FONT_SIZE,
      originX: "center",
      originY: "top",
      splitByGrapheme: true, // Enables proper text wrapping
      textAlign: DEFAULT_TEXT_ALIGNMENT,
      width: visibleWidth,
    });

    // Immediately enter edit mode for user convenience
    textbox.enterEditing();

    // Remove empty text elements to prevent clutter
    textbox.on("editing:exited", () => {
      if (!textbox.text || textbox.text.trim() === "") {
        canvas.remove(textbox);
      }
    });

    addToArtboard(textbox, artboard, canvas, x, y);
  }, [ensureRefs]);

  /**
   * Adds a shape element to the canvas center.
   *
   * Creates shapes using the factory function and handles creation errors gracefully.
   * Displays error notifications for invalid shape types or creation failures.
   *
   * @param {ShapeType} type - Type of shape to create (e.g., "square", "ellipse", "triangle", "line", "polygon")
   */
  const handleAddShape = useCallback(
    (type: ShapeType) => {
      const { ok, canvas, artboard } = ensureRefs();
      if (!ok) return;

      /** Calculate center position of artboard */
      const { x, y } = getArtboardCenterPoint(artboard);

      try {
        // Create shape using factory function
        const shape = createShape(type);
        addToArtboard(shape, artboard, canvas, x, y);
      } catch (err) {
        // Display user-friendly error message
        toast.error(err instanceof Error ? err.message : String(err));
      }
    },
    [ensureRefs],
  );

  /**
   * Adds a placeholder element to the canvas center.
   *
   * Creates placeholder elements for content that will be populated later
   * (e.g., image placeholders, content blocks). Useful for template creation.
   *
   * @param {PlaceholderVariant} variant - Type of placeholder to create (e.g., 'recipient', 'qr-code', 'certificate-id', 'custom)
   */
  const handleAddPlaceholder = useCallback(
    async (variant: PlaceholderVariant) => {
      const { ok, canvas, artboard } = ensureRefs();
      if (!ok) return;

      /** Calculate center position of artboard */
      const { x, y } = getArtboardCenterPoint(artboard);

      // Create placeholder using factory function
      const placeholder = await createPlaceholder(variant);
      addToArtboard(placeholder, artboard, canvas, x, y);
    },
    [ensureRefs],
  );

  /**
   * Triggers the file input for image uploads and handles image addition.
   * Validates image size (max 5MB) and adds valid images to the canvas center.
   */
  const handleAddImage = useCallback(() => {
    const { ok, canvas, artboard } = ensureRefs();
    if (!ok || !imageFileRef.current) {
      toast.error("Canvas or file input unavailable.");
      return;
    }

    const fileInput = imageFileRef.current;

    // Trigger file input click
    fileInput.click();

    // Handle file selection
    fileInput.onchange = () => {
      const file = fileInput?.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a PNG, JPEG, or JPG image.",
        );
        fileInput.value = "";
        return;
      }

      // Validate file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size exceeds 5MB limit.");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;

        // Create a temporary image to get dimensions
        const tempImg = new Image();
        tempImg.onload = () => {
          const artboardWidth = artboard.width ?? 100;
          const artboardHeight = artboard.height ?? 100;

          // Calculate target dimensions (max artboard size)
          const imgAspect = tempImg.width / tempImg.height;
          const artboardAspect = artboardWidth / artboardHeight;

          let targetWidth, targetHeight;
          if (imgAspect > artboardAspect) {
            targetWidth = artboardWidth;
            targetHeight = artboardWidth / imgAspect;
          } else {
            targetHeight = artboardHeight;
            targetWidth = artboardHeight * imgAspect;
          }

          // Create canvas to resize image
          const resizeCanvas = document.createElement("canvas");
          resizeCanvas.width = targetWidth;
          resizeCanvas.height = targetHeight;
          const ctx = resizeCanvas.getContext("2d", {
            alpha: true,
            willReadFrequently: false,
          });

          if (!ctx) {
            toast.error("Failed to process image.");
            return;
          }

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw resized image
          ctx.drawImage(tempImg, 0, 0, targetWidth, targetHeight);

          // Export as optimized data URL with quality control
          let optimizedDataURL: string;

          if (file.type === "image/png") {
            // PNG: no quality parameter, lossless compression
            optimizedDataURL = resizeCanvas.toDataURL("image/png");
          } else {
            // JPEG: use quality parameter (0.9 = 90% quality)
            // Adjust quality between 0.8-0.95 for size/quality balance
            optimizedDataURL = resizeCanvas.toDataURL("image/jpeg", 0.7);
          }

          // Load into Fabric
          FabricImage.fromURL(optimizedDataURL, { crossOrigin: "anonymous" })
            .then((img) => {
              if (!img) {
                throw new Error("Failed to load image. Please try again");
              }

              img.scaleToWidth(artboardWidth);

              const { x, y } = getArtboardCenterPoint(artboard);
              addToArtboard(img, artboard, canvas, x, y);

              fileInput.value = "";
            })
            .catch((err: unknown) => {
              const message =
                err instanceof Error
                  ? err.message
                  : "Failed to load image. Please try again";
              toast.error(message);
            });
        };

        tempImg.onerror = () => {
          toast.error("Failed to load image. Please try again.");
        };

        tempImg.src = imageSrc;
      };

      reader.readAsDataURL(file);
    };
  }, [ensureRefs, imageFileRef]);

  return {
    handleAddText,
    handleAddShape,
    handleAddPlaceholder,
    handleAddImage,
    imageFileRef,
  };
};
