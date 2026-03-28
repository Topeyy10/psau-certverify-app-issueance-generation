"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const usePreviewUrl = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const setUrl = useCallback((url: string | null) => {
    // Clean up previous URL
    if (urlRef.current) {
      try {
        URL.revokeObjectURL(urlRef.current);
      } catch (err: unknown) {
        console.warn("Failed to revoke preview URL:", err);
      }
    }

    urlRef.current = url;
    setPreviewUrl(url);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        try {
          URL.revokeObjectURL(urlRef.current);
        } catch (err: unknown) {
          console.warn("Failed to revoke preview URL on unmount:", err);
        }
      }
    };
  }, []);

  return [previewUrl, setUrl] as const;
};
