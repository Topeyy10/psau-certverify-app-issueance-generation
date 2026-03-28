import {
  type CameraDevice,
  Html5Qrcode,
  type Html5QrcodeCameraScanConfig,
  Html5QrcodeScannerState,
} from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";

/** Cache duration for camera devices in milliseconds */
const CACHE_DURATION_MS = 5 * 60 * 1000;
/** Default timeout for scanner operations in milliseconds */
const SCANNER_TIMEOUT_MS = 5000;
/** Debounce delay for camera switching operations in milliseconds */
const CAMERA_SWITCH_DEBOUNCE_MS = 300;

/**
 * Extended configuration interface for QR scanner with timeout support
 * @interface QRScannerConfig
 * @extends Html5QrcodeCameraScanConfig
 */
interface QRScannerConfig extends Html5QrcodeCameraScanConfig {
  /** Optional timeout in milliseconds for scanner operations */
  timeoutMs?: number;
}

/**
 * Camera cache structure for optimized device enumeration
 * @interface CameraCache
 */
interface CameraCache {
  /** Array of available camera devices */
  devices: CameraDevice[];
  /** Timestamp of last successful fetch */
  lastFetch: number;
  /** Current loading state */
  isLoading: boolean;
  /** Active loading promise to prevent duplicate requests */
  loadingPromise: Promise<CameraDevice[]> | null;
}

/**
 * Return type for the useScanner hook
 * @interface UseScanner
 */
interface UseScanner {
  /** Whether the scanner is currently active */
  isActive: boolean;
  /** Whether the scanner is in initialization state */
  isInitializing: boolean;
  /** Current error message, null if no error */
  error: string | null;
  /** Array of available camera devices */
  cameras: CameraDevice[];
  /** ID of currently selected camera device */
  selectedCameraID: string | null;
  /** Function to start the QR scanner */
  startScanner: () => Promise<void>;
  /** Function to stop the QR scanner */
  stopScanner: () => Promise<void>;
  /** Function to switch to a different camera */
  switchCamera: (id: string) => Promise<void>;
  /** Function to refresh the list of available cameras */
  refreshCameras: () => Promise<CameraDevice[]>;
  /** Function to clear current error state */
  clearError: () => void;
}

/**
 * Custom React hook for QR code scanning with camera management
 *
 * This hook provides a complete QR scanner solution with camera enumeration,
 * switching capabilities, error handling, and performance optimizations including
 * camera caching and operation timeouts.
 *
 * @param {function} onScanSuccess - Callback function executed when QR code is successfully scanned
 * @param {string} elementID - DOM element ID where the scanner will be rendered
 * @param {QRScannerConfig} config - Scanner configuration options
 * @returns {UseScanner} Object containing scanner state and control functions
 *
 * @example
 * ```tsx
 * const scanner = useScanner(
 *   (data) => console.log('Scanned:', data),
 *   'qr-scanner-element',
 *   { fps: 10, qrbox: { width: 200, height: 200 } }
 * );
 *
 * return (
 *   <div>
 *     <div id="qr-scanner-element" />
 *     <button onClick={scanner.startScanner}>Start Scanner</button>
 *     <button onClick={scanner.stopScanner}>Stop Scanner</button>
 *   </div>
 * );
 * ```
 */
export const useScanner = (
  onScanSuccess: (data: string) => void,
  elementID: string,
  config: QRScannerConfig = {
    fps: 10,
    timeoutMs: SCANNER_TIMEOUT_MS,
  },
) => {
  // State management for scanner status and data
  const [isActive, setIsActive] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraID, setSelectedCameraID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Refs for managing scanner instance and async operations
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cameraSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Camera cache to minimize device enumeration calls
  const cameraCacheRef = useRef<CameraCache>({
    devices: [],
    lastFetch: 0,
    isLoading: false,
    loadingPromise: null,
  });

  /**
   * Centralized error handler with logging and state management
   * @param {string} message - Error message to display
   * @param {Error} [err] - Optional error object for detailed logging
   */
  const handleError = useCallback((message: string, err?: Error) => {
    console.error(message, err);
    setError(message);
    setIsInitializing(false);
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Retrieves camera devices with caching mechanism to improve performance
   * Implements timeout and abort functionality for robust operation
   * @returns {Promise<CameraDevice[]>} Promise resolving to array of camera devices
   */
  const getCachedCameras = useCallback(async (): Promise<CameraDevice[]> => {
    const now = Date.now();
    const cache = cameraCacheRef.current;

    // Return cached devices if still valid
    if (cache.devices.length > 0 && now - cache.lastFetch < CACHE_DURATION_MS) {
      return cache.devices;
    }

    // Return existing promise if already loading
    if (cache.loadingPromise) {
      return cache.loadingPromise;
    }

    // Create abort controller for operation cancellation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    cache.isLoading = true;
    // Race between camera enumeration and timeout
    cache.loadingPromise = Promise.race([
      Html5Qrcode.getCameras(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(
          () => reject(new Error("Camera enumeration timeout")),
          config.timeoutMs || SCANNER_TIMEOUT_MS,
        );
        // Handle abort signal
        abortController.signal.addEventListener("abort", () => {
          clearTimeout(timeoutId);
          reject(new Error("Camera enumeration aborted"));
        });
      }),
    ])
      .then((devices) => {
        // Update cache only if not aborted
        if (!abortController.signal.aborted) {
          cache.devices = devices;
          cache.lastFetch = now;
        }
        return devices;
      })
      .catch((err) => {
        // Return cached devices on abort, otherwise propagate error
        if (!abortController.signal.aborted) {
          throw err;
        }
        return cache.devices;
      })
      .finally(() => {
        // Cleanup cache state
        cache.isLoading = false;
        cache.loadingPromise = null;
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      });

    return cache.loadingPromise;
  }, [config.timeoutMs]);

  /**
   * Stops the QR scanner and cleans up resources
   * @param {boolean} [shouldHideUI=true] - Whether to update UI state
   * @returns {Promise<void>} Promise that resolves when scanner is stopped
   */
  const stopScanner = useCallback(
    async (shouldHideUI = true): Promise<void> => {
      const scanner = scannerRef.current;

      if (!scanner) {
        if (shouldHideUI) {
          setIsActive(false);
          setIsInitializing(false);
        }
        return;
      }

      const scannerState = scanner.getState();
      // Only attempt to stop if scanner is in active states
      if (
        ![
          Html5QrcodeScannerState.SCANNING,
          Html5QrcodeScannerState.PAUSED,
        ].includes(scannerState)
      ) {
        scannerRef.current = null;
        if (shouldHideUI) {
          setIsActive(false);
          setIsInitializing(false);
        }
        return;
      }

      try {
        // Race between scanner stop and timeout to prevent hanging
        await Promise.race([
          scanner.stop().then(() => scanner.clear()),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Scanner stop timeout")),
              config.timeoutMs || SCANNER_TIMEOUT_MS,
            ),
          ),
        ]);
      } catch (err) {
        console.warn("Scanner stop failed:", err);
      } finally {
        // Always cleanup scanner reference and UI state
        scannerRef.current = null;
        if (shouldHideUI) {
          setIsActive(false);
          setIsInitializing(false);
        }
      }
    },
    [config.timeoutMs],
  );

  /**
   * Waits for DOM element to be available with timeout
   * @param {string} elementId - ID of the element to wait for
   * @param {number} [timeoutMs=5000] - Maximum wait time in milliseconds
   * @returns {Promise<HTMLElement>} Promise resolving to the found element
   */
  const waitForElement = useCallback(
    (elementId: string, timeoutMs: number = 5000): Promise<HTMLElement> => {
      return new Promise((resolve, reject) => {
        // Polling function to check element existence
        const checkElement = () => {
          const element = document.getElementById(elementId);
          if (element) {
            resolve(element);
            return;
          }
          setTimeout(checkElement, 50); // Poll every 50ms
        };
        checkElement();
        // Reject after timeout
        setTimeout(
          () =>
            reject(
              new Error(
                `Element with id=${elementId} not found within ${timeoutMs}ms`,
              ),
            ),
          timeoutMs,
        );
      });
    },
    [],
  );

  /**
   * Initializes camera for QR scanning with specified device ID
   * @param {string} targetID - Camera device ID to initialize
   * @returns {Promise<void>} Promise that resolves when camera is initialized
   */
  const initializeCamera = useCallback(
    async (targetID: string): Promise<void> => {
      clearError();
      try {
        // Stop any existing scanner instance
        await stopScanner(false);
        // Ensure DOM element exists before proceeding
        await waitForElement(elementID);

        const scanner = new Html5Qrcode(elementID);
        const scanConfig: Html5QrcodeCameraScanConfig = {
          fps: config.fps || 10,
        };

        // Race between scanner start and timeout
        await Promise.race([
          scanner.start(
            { deviceId: { exact: targetID } },
            scanConfig,
            // Success callback - executes when QR code is detected
            (decodedText: string) => {
              onScanSuccess(decodedText);
              stopScanner();
            },
            // Error callback - handles scanning errors (mostly benign)
            (error: string) => {
              // Filter out common non-critical errors
              if (
                !error.includes("NotFoundException") &&
                !error.includes("No QR code found") &&
                !error.includes("No MultiFormat Readers")
              ) {
                console.warn("QR Scan Warning:", error);
              }
            },
          ),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Scanner start timeout")),
              config.timeoutMs || SCANNER_TIMEOUT_MS,
            ),
          ),
        ]);

        scannerRef.current = scanner;
      } catch (error) {
        handleError("Failed to initialize camera", error as Error);
        throw error;
      } finally {
        setIsInitializing(false);
      }
    },
    [
      elementID,
      config,
      onScanSuccess,
      stopScanner,
      handleError,
      clearError,
      waitForElement,
    ],
  );

  /**
   * Starts the QR scanner with optional device selection
   * @param {string} [deviceId] - Optional specific camera device ID to use
   * @returns {Promise<void>} Promise that resolves when scanner starts
   */
  const startScanner = useCallback(
    async (deviceId?: string) => {
      // Prevent multiple simultaneous start attempts
      if (isInitializing || scannerRef.current) {
        return;
      }

      setIsInitializing(true);
      setIsActive(true);
      clearError();

      try {
        // Get available cameras and update state
        const devices = await getCachedCameras();
        setCameras(devices);

        // Determine target camera: provided ID > selected ID > first available
        const targetDeviceID = deviceId || selectedCameraID || devices[0]?.id;
        if (!targetDeviceID) {
          throw new Error("No camera devices available");
        }

        setSelectedCameraID(targetDeviceID);
        await initializeCamera(targetDeviceID);
      } catch (err) {
        handleError("Failed to start scanner", err as Error);
      }
    },
    [
      isInitializing,
      selectedCameraID,
      getCachedCameras,
      initializeCamera,
      handleError,
      clearError,
    ],
  );

  /**
   * Switches to a different camera device with debouncing
   * @param {string} deviceId - Camera device ID to switch to
   * @returns {Promise<void>} Promise that resolves when camera is switched
   */
  const switchCamera = useCallback(
    async (deviceId: string) => {
      // Clear any pending camera switch operations
      if (cameraSwitchTimeoutRef.current) {
        clearTimeout(cameraSwitchTimeoutRef.current);
      }

      // If scanner is inactive, just update selected camera
      if (!isActive) {
        setSelectedCameraID(deviceId);
        return;
      }

      // Debounce camera switching to prevent rapid successive switches
      cameraSwitchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsInitializing(true);
          await stopScanner(false);
          setSelectedCameraID(deviceId);
          await initializeCamera(deviceId);
        } catch (err) {
          handleError("Failed to switch camera", err as Error);
        }
      }, CAMERA_SWITCH_DEBOUNCE_MS);
    },
    [isActive, stopScanner, initializeCamera, handleError],
  );

  /**
   * Refreshes the list of available cameras by clearing cache
   * @returns {Promise<CameraDevice[]>} Promise resolving to updated camera list
   */
  const refreshCameras = useCallback(async () => {
    // Abort any ongoing camera enumeration
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Force cache invalidation
    cameraCacheRef.current.lastFetch = 0;
    cameraCacheRef.current.loadingPromise = null;

    try {
      const devices = await getCachedCameras();
      setCameras(devices);
      return devices;
    } catch (err) {
      handleError("Failed to refresh cameras", err as Error);
      return [];
    }
  }, [getCachedCameras, handleError]);

  /**
   * Cleanup function to clear all timeouts and stop scanner
   * Called on component unmount or dependency changes
   */
  const cleanup = useCallback(() => {
    // Clear camera switch timeout
    if (cameraSwitchTimeoutRef.current) {
      clearTimeout(cameraSwitchTimeoutRef.current);
      cameraSwitchTimeoutRef.current = null;
    }

    // Abort any ongoing async operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop scanner and clear cache promise
    stopScanner(true);
    cameraCacheRef.current.loadingPromise = null;
  }, [stopScanner]);

  // Cleanup on component unmount
  useEffect(() => cleanup, [cleanup]);

  return {
    isActive,
    isInitializing,
    error,
    cameras,
    selectedCameraID,
    startScanner: () => startScanner(),
    stopScanner: () => stopScanner(true),
    switchCamera,
    refreshCameras,
    clearError,
  };
};
