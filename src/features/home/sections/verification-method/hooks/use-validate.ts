import jsQR from "jsqr";
import { useCallback } from "react";
import { verifyCertificateId } from "@/aactions/certificates";
import type { CertificateData } from "../types/verification.types";

/** Maximum dimension for image processing to maintain performance */
const MAX_IMAGE_DIMENSION = 2048;
/** Scale factor for PDF rendering to balance quality and performance */
const PDF_SCALE = 1.5;

/**
 * Callback functions interface for validation process lifecycle management
 * @interface FunctionProperties
 */
interface FunctionProperties {
  /** Callback to initiate processing with optional message */
  startProcessing: (message?: string) => void;
  /** Callback to complete processing with optional success message */
  stopProcessing: (successMessage?: string) => void;
  /** Callback to handle processing errors with severity and message options */
  stopProcessingWithError: (
    error: Error | string | undefined,
    critical?: boolean,
    errorMessage?: string,
  ) => void;
  /** Callback to update processing status message */
  updateProcessingMessage: (message: string) => void;
  /** Callback triggered when certificate data changes */
  onDataChange: (data: CertificateData | null) => void;
}

/**
 * Return interface for the useValidate hook
 * @interface UseValidate
 */
export interface UseValidate {
  /** Function to validate certificate by ID */
  processID: (id: string) => Promise<void>;
  /** Function to process and validate image files containing QR codes */
  processImage: (file: File) => Promise<void>;
  /** Function to process and validate PDF files containing QR codes */
  processPDF: (file: File) => Promise<void>;
}

/**
 * Custom React hook for certificate validation across multiple input types
 *
 * This hook provides comprehensive certificate validation functionality supporting:
 * - Direct ID validation
 * - Image-based QR code scanning and validation
 * - PDF-based QR code scanning and validation
 *
 * The hook implements optimized image processing with automatic resizing,
 * robust QR code detection, and proper resource management with cleanup.
 * It uses a callback-driven architecture for flexible integration with
 * different UI frameworks and state management systems.
 *
 * Key features:
 * - Automatic image optimization for performance
 * - Memory-efficient resource management
 * - Progressive status updates during processing
 * - Comprehensive error handling with severity levels
 * - QR code detection with inversion attempts
 *
 * @param {FunctionProperties} props - Callback functions for process lifecycle management
 * @returns {UseValidate} Object containing validation functions for different input types
 *
 * @example
 * ```tsx
 * const MyValidationComponent = () => {
 *   const validator = useValidate({
 *     startProcessing: (msg) => setStatus({ loading: true, message: msg }),
 *     stopProcessing: (msg) => setStatus({ loading: false, success: msg }),
 *     stopProcessingWithError: (err, critical, msg) => {
 *       setStatus({ loading: false, error: msg });
 *       if (critical) console.error(err);
 *     },
 *     updateProcessingMessage: (msg) => setStatus(prev => ({ ...prev, message: msg })),
 *     onDataChange: (data) => setCertificateData(data),
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         accept="image/*"
 *         onChange={(e) => e.target.files?.[0] && validator.processImage(e.target.files[0])}
 *       />
 *     </div>
 *   );
 * };
 * ```
 */
export const useValidate = (props: FunctionProperties): UseValidate => {
  const {
    startProcessing,
    stopProcessing,
    stopProcessingWithError,
    updateProcessingMessage,
    onDataChange,
  } = props;

  /**
   * Creates an optimized HTML5 Canvas with 2D context
   *
   * Configures the canvas for high-quality image processing with:
   * - Image smoothing enabled for better QR code recognition
   * - High-quality smoothing algorithm
   * - Optimized context for frequent pixel data reading
   *
   * @param {number} width - Canvas width in pixels
   * @param {number} height - Canvas height in pixels
   * @returns {Object} Object containing canvas element and 2D context
   * @throws {Error} When unable to create canvas context
   */
  const createCanvas = useCallback((width: number, height: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Request context optimized for frequent pixel data reading
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("Unable to create canvas context");
    }

    // Enable high-quality image smoothing for better QR detection
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    return { canvas, ctx };
  }, []);

  /**
   * Resizes canvas to fit within maximum dimension constraints
   *
   * Maintains aspect ratio while ensuring neither dimension exceeds the maximum.
   * Returns original canvas if no resizing is needed for performance optimization.
   *
   * @param {HTMLCanvasElement} sourceCanvas - Source canvas to resize
   * @param {number} maxDimension - Maximum allowed dimension for width or height
   * @returns {HTMLCanvasElement} Resized canvas or original if no resize needed
   */
  const resizeCanvas = useCallback(
    (
      sourceCanvas: HTMLCanvasElement,
      maxDimension: number,
    ): HTMLCanvasElement => {
      const { width, height } = sourceCanvas;

      // Return original canvas if already within limits
      if (width <= maxDimension && height <= maxDimension) {
        return sourceCanvas;
      }

      // Calculate scaling ratio maintaining aspect ratio
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      const newWidth = Math.floor(width * ratio);
      const newHeight = Math.floor(height * ratio);

      // Create new canvas with scaled dimensions
      const { canvas, ctx } = createCanvas(newWidth, newHeight);
      ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);

      return canvas;
    },
    [createCanvas],
  );

  /**
   * Scans canvas for QR codes using jsQR library
   *
   * Implements robust QR code detection with inversion attempts to handle
   * both light and dark QR codes. Includes comprehensive error handling
   * to prevent scanning failures from breaking the validation flow.
   *
   * @param {HTMLCanvasElement} canvas - Canvas containing image to scan
   * @returns {string | null} QR code data if found, null otherwise
   */
  const scanForQRCode = useCallback(
    (canvas: HTMLCanvasElement): string | null => {
      try {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.warn("Unable to get canvas context for QR scanning");
          return null;
        }

        // Extract image data for QR scanning
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Attempt QR detection with both normal and inverted colors
        const result = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: "attemptBoth",
        });

        return result?.data ?? null;
      } catch (error) {
        console.warn("QR scanning failed:", error);
        return null;
      }
    },
    [],
  );

  /**
   * Processes certificate validation by ID with comprehensive validation
   *
   * Validates certificate ID format, length, and performs API validation.
   * Currently includes mock implementation that should be replaced with
   * actual API integration. Supports silent mode for internal calls.
   *
   * @param {string} id - Certificate ID to validate
   * @param {boolean} [silent=false] - Whether to skip UI notifications
   * @returns {Promise<void>} Promise that resolves when validation completes
   * @throws {Error} When ID is invalid or validation fails
   */
  const processID = useCallback(
    async (id: string, silent: boolean = false) => {
      try {
        // Skip UI notifications for internal calls (e.g., from QR processing)
        if (!silent) {
          startProcessing("Validating certificate...");
        }

        // Validate ID format and content
        if (!id || typeof id !== "string" || id.trim() === "") {
          throw new Error("Invalid Certificate ID: ID cannot be empty");
        }

        const trimmedId = id.trim();
        if (trimmedId.length < 3) {
          throw new Error("Invalid Certificate ID: ID too short");
        }

        const result = await verifyCertificateId(trimmedId);

        if (!result.ok) {
          // This now properly handles server action errors
          throw new Error(result.error);
        }

        if (result.data) {
          onDataChange(result.data);
        }
        stopProcessing("Validation Complete");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown validation error";
        stopProcessingWithError(
          error instanceof Error ? error : undefined,
          false,
          errorMessage,
        );
        throw error;
      }
    },
    [startProcessing, stopProcessing, stopProcessingWithError, onDataChange],
  );

  /**
   * Processes PDF files for QR code extraction and validation
   *
   * Implements comprehensive PDF processing with:
   * - PDF.js integration for rendering
   * - Single-page validation for certificate requirements
   * - High-quality rendering with configurable scaling
   * - Memory-efficient resource management
   * - Progressive status updates
   *
   * @param {File} file - PDF file to process
   * @returns {Promise<void>} Promise that resolves when processing completes
   * @throws {Error} When PDF processing or QR detection fails
   */
  const processPDF = useCallback(
    async (file: File) => {
      startProcessing("Processing PDF...");

      // Resource tracking for proper cleanup
      let pdf: any = null;
      let canvas: HTMLCanvasElement | null = null;
      let finalCanvas: HTMLCanvasElement | null = null;

      try {
        // Dynamic import of PDF.js to reduce initial bundle size
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        updateProcessingMessage("Reading PDF file...");
        const arrayBuffer = await file.arrayBuffer();

        updateProcessingMessage("Loading PDF document...");
        try {
          const loadingTask = pdfjs.getDocument({
            data: arrayBuffer,
            useSystemFonts: true, // Improve rendering quality
          });
          pdf = await loadingTask.promise;
        } catch (err: any) {
          // Handle specific PDF errors with user-friendly messages
          if (err?.name === "PasswordException") {
            throw new Error("Password protected PDFs are not supported");
          }
          throw new Error(
            `Failed to load PDF: ${err.message || "Unknown error"}`,
          );
        }

        // Enforce single-page requirement for certificates
        if (pdf.numPages !== 1) {
          throw new Error(
            "Issued certificates must have exactly one page. Please try again",
          );
        }

        updateProcessingMessage("Rendering PDF page...");
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: PDF_SCALE });

        // Create canvas for PDF rendering
        const canvasResult = createCanvas(viewport.width, viewport.height);
        canvas = canvasResult.canvas;

        // Render PDF page to canvas with print intent for better quality
        await page.render({
          canvasContext: canvasResult.ctx,
          viewport,
          intent: "print",
        }).promise;

        updateProcessingMessage("Optimizing image for scanning...");
        // Resize if necessary to stay within performance limits
        finalCanvas = resizeCanvas(canvas, MAX_IMAGE_DIMENSION);

        updateProcessingMessage("Scanning for QR code...");
        const qrData = scanForQRCode(finalCanvas);

        if (qrData) {
          updateProcessingMessage("QR code detected, validating...");
          // Process QR data silently since UI is already handling this operation
          await processID(qrData, true);
        } else {
          throw new Error("No QR code found in the PDF");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        // Classify errors as known/user-friendly vs critical/technical
        const isKnownError =
          errorMessage.includes("Password protected") ||
          errorMessage.includes("exactly one page") ||
          errorMessage.includes("No QR code found");

        stopProcessingWithError(
          err instanceof Error ? err : new Error(errorMessage),
          !isKnownError, // Critical flag for unknown errors
          errorMessage,
        );
        throw err;
      } finally {
        // Comprehensive resource cleanup to prevent memory leaks
        try {
          if (pdf) pdf.destroy(); // Release PDF.js resources
          if (canvas && canvas !== finalCanvas) canvas.remove(); // Remove intermediate canvas
          if (finalCanvas) finalCanvas.remove(); // Remove final canvas
        } catch (cleanupError) {
          console.warn("Cleanup warning:", cleanupError);
        }
      }
    },
    [
      createCanvas,
      processID,
      resizeCanvas,
      scanForQRCode,
      startProcessing,
      stopProcessingWithError,
      updateProcessingMessage,
    ],
  );

  /**
   * Processes image files for QR code extraction and validation
   *
   * Implements efficient image processing with:
   * - Intelligent resizing based on image dimensions
   * - ImageBitmap API for optimal performance
   * - Memory-efficient resource management
   * - High-quality resizing algorithms
   * - Progressive status updates
   *
   * @param {File} file - Image file to process
   * @returns {Promise<void>} Promise that resolves when processing completes
   * @throws {Error} When image processing or QR detection fails
   */
  const processImage = useCallback(
    async (file: File) => {
      startProcessing("Processing image...");

      // Resource tracking for proper cleanup
      let imageBitmap: ImageBitmap | null = null;
      let resizedBitmap: ImageBitmap | null = null;
      let canvas: HTMLCanvasElement | null = null;

      try {
        updateProcessingMessage("Decoding image...");

        // Efficiently check if resizing is needed before creating ImageBitmap
        const needsResize = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve(
              img.width > MAX_IMAGE_DIMENSION ||
                img.height > MAX_IMAGE_DIMENSION,
            );
          };
          img.onerror = () => resolve(false); // Default to no resize on error
          img.src = URL.createObjectURL(file);
        });

        if (needsResize) {
          // Create initial bitmap to get dimensions
          imageBitmap = await createImageBitmap(file);

          // Calculate optimal scaling ratio
          const ratio = Math.min(
            MAX_IMAGE_DIMENSION / imageBitmap.width,
            MAX_IMAGE_DIMENSION / imageBitmap.height,
          );

          const newWidth = Math.floor(imageBitmap.width * ratio);
          const newHeight = Math.floor(imageBitmap.height * ratio);

          // Create resized bitmap with high-quality algorithm
          resizedBitmap = await createImageBitmap(file, {
            resizeWidth: newWidth,
            resizeHeight: newHeight,
            resizeQuality: "high",
          });
        } else {
          // Create bitmap at original size
          resizedBitmap = await createImageBitmap(file);
        }

        updateProcessingMessage("Preparing image for scanning...");
        // Transfer bitmap to canvas for QR scanning
        const canvasResult = createCanvas(
          resizedBitmap.width,
          resizedBitmap.height,
        );
        canvas = canvasResult.canvas;
        canvasResult.ctx.drawImage(resizedBitmap, 0, 0);

        updateProcessingMessage("Scanning for QR code...");
        const qrData = scanForQRCode(canvas);

        if (qrData) {
          updateProcessingMessage("QR code detected, validating...");
          // Process QR data silently since UI is already handling this operation
          await processID(qrData, true);
        } else {
          throw new Error("No QR code found in the image");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isKnownError = errorMessage.includes("No QR code found");

        stopProcessingWithError(
          err instanceof Error ? err : new Error(errorMessage),
          !isKnownError, // Critical flag for unknown errors
          errorMessage,
        );
        throw err;
      } finally {
        // Comprehensive resource cleanup to prevent memory leaks
        try {
          if (imageBitmap) imageBitmap.close(); // Release ImageBitmap resources
          if (resizedBitmap && resizedBitmap !== imageBitmap)
            resizedBitmap.close();
          if (canvas) canvas.remove(); // Remove canvas from DOM
        } catch (cleanupError) {
          console.warn("Cleanup warning:", cleanupError);
        }
      }
    },
    [
      createCanvas,
      processID,
      scanForQRCode,
      startProcessing,
      stopProcessingWithError,
      updateProcessingMessage,
    ],
  );

  // Return validation functions for external use
  return {
    processID,
    processImage,
    processPDF,
  };
};
