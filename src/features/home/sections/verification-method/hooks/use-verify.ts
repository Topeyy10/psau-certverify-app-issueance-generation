import { useShallow } from "zustand/react/shallow";
import { useToastStore } from "@/stores/toast-store";
import { useVerifyStore } from "../store/verifyStore";
import type { CertificateData } from "../types/verification.types";
import { type UseValidate, useValidate } from "./use-validate";

/**
 * Custom React hook for certificate verification with integrated UI state management
 *
 * This hook provides a high-level interface for certificate verification operations,
 * combining validation logic with toast notifications and store state management.
 * It orchestrates the verification process across different input types (ID, image, PDF)
 * while maintaining consistent UI feedback and error handling.
 *
 * The hook integrates three key systems:
 * - Toast notifications for user feedback
 * - Verification store for state management
 * - Validation logic for processing different input types
 *
 * @returns {UseValidate} Object containing verification functions for different input types
 *
 * @example
 * ```tsx
 * const MyVerificationComponent = () => {
 *   const { processID, processImage, processPDF } = useVerify();
 *
 *   const handleVerifyById = async (certificateId: string) => {
 *     await processID(certificateId);
 *   };
 *
 *   const handleVerifyByImage = async (imageFile: File) => {
 *     await processImage(imageFile);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => handleVerifyById('cert-123')}>
 *         Verify by ID
 *       </button>
 *       <input
 *         type="file"
 *         onChange={(e) => e.target.files?.[0] && handleVerifyByImage(e.target.files[0])}
 *       />
 *     </div>
 *   );
 * };
 * ```
 */
export const useVerify = (): UseValidate => {
  // Extract toast notification functions for user feedback
  const { start, update, stopError, stopSuccess } = useToastStore();

  // Extract verification store functions with shallow comparison for performance
  // useShallow prevents unnecessary re-renders when other store properties change
  const { setProcessing, setResults, setDisplayResults, clearResults } =
    useVerifyStore(
      useShallow((s) => ({
        setProcessing: s.setProcessing,
        setResults: s.setResults,
        setDisplayResults: s.setDisplayResults,
        clearResults: s.clearResults,
      })),
    );

  /**
   * Updates certificate data in the store and displays results
   *
   * This function handles the final step of certificate verification by:
   * 1. Clearing any previous results to ensure clean state
   * 2. Setting the new certificate data
   * 3. Triggering the display of results in the UI
   *
   * @param {CertificateData | null} data - Certificate data to store and display, null if verification failed
   */
  const updateCertificateData = (data: CertificateData | null) => {
    clearResults(); // Clear previous verification results
    setResults(data); // Store the new certificate data (or null on failure)
    setDisplayResults(true); // Signal UI to display the results
  };

  // Initialize validation hook with callback configuration
  // These callbacks create a bridge between the validation logic and UI state
  const { processID, processImage, processPDF } = useValidate({
    /**
     * Callback executed when verification process starts
     * Initializes loading state and displays progress toast
     * @param {string} [message='Verifying...'] - Progress message to display
     */
    startProcessing: (message: string = "Verifying...") => {
      setProcessing(true); // Set global loading state
      start(message); // Display progress toast notification
    },

    /**
     * Callback for updating progress message during verification
     * Allows real-time feedback to user during long-running operations
     */
    updateProcessingMessage: update,

    /**
     * Callback executed when verification completes successfully
     * Clears loading state and displays success notification
     * @param {string} [successMessage='Completed'] - Success message to display
     */
    stopProcessing: (successMessage: string = "Completed") => {
      setProcessing(false); // Clear global loading state
      stopSuccess(successMessage); // Display success toast notification
    },

    /**
     * Callback executed when verification fails with error
     * Handles error display and logging based on severity
     * @param {Error | string | undefined} error - The error that occurred during verification
     * @param {boolean} [critical=false] - Whether the error is critical (requires console logging)
     * @param {string} [errorMessage='Failed'] - User-friendly error message
     */
    stopProcessingWithError: (
      error: Error | string | undefined,
      critical: boolean = false,
      errorMessage: string = "Failed",
    ) => {
      setProcessing(false); // Clear global loading state

      // Create detailed description for critical errors
      const description = critical
        ? `${errorMessage}. See console for more info.`
        : errorMessage;

      // Log critical errors to console for debugging
      if (critical) console.error(errorMessage, error);

      // Display error toast with title and description
      stopError("Verification Failed", description);
    },

    /**
     * Callback executed when certificate data changes
     * Bridges validation results to store management
     */
    onDataChange: updateCertificateData,
  });

  // Return the verification functions for external use
  // These functions are provided by useValidate and configured with our callbacks
  return { processID, processImage, processPDF };
};
