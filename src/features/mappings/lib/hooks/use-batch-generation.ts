"use client";

import { clientUniqueId } from "@/lib/id";
import { useCallback, useEffect, useRef, useState } from "react";
import { sanitizeFilename } from "@/aactions/shared/utils";
import { BATCH_DELAY, CHUNK_SIZE } from "../constants";
import { useData } from "../contexts/data-provider";
import type { BatchState, StorageResult } from "../types";
import { createUrlManager } from "../utils/url";

export const useBatchGeneration = () => {
  const { state, generateCertificate } = useData();
  const [batchState, setBatchState] = useState<BatchState>({
    isOpen: false,
    isGenerating: false,
    progress: 0,
    completed: 0,
    total: 0,
    failedRows: [],
    completedCertificates: [],
    consecutiveFailures: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { cleanupUrl, cleanupAllUrls, addUrl } = createUrlManager();

  const resetToDefaults = useCallback(() => {
    cleanupAllUrls();
    setBatchState({
      isOpen: true,
      isGenerating: true,
      progress: 0,
      completed: 0,
      total: state.data.length,
      failedRows: [],
      completedCertificates: [],
      consecutiveFailures: 0,
    });
  }, [state.data.length, cleanupAllUrls]);

  const updateProgress = useCallback(
    (
      completed: number,
      total: number,
      newResult?: StorageResult,
      failedRowId?: string,
      consecutiveFailures?: number,
    ) => {
      setBatchState((prev) => {
        const newCertificates = newResult
          ? [...prev.completedCertificates, newResult]
          : prev.completedCertificates;

        return {
          ...prev,
          completed,
          progress: Math.round((completed / total) * 100),
          completedCertificates: newCertificates,
          failedRows: failedRowId
            ? [...prev.failedRows, failedRowId]
            : prev.failedRows,
          consecutiveFailures:
            consecutiveFailures !== undefined
              ? consecutiveFailures
              : prev.consecutiveFailures,
          isGenerating: completed < total,
        };
      });
    },
    [],
  );

  //   const processChunk = useCallback(
  //   async (
  //     rows: typeof state.data,
  //     startIndex: number,
  //     chunkSize: number,
  //     completed: number,
  //     currentConsecutiveFailures: number,
  //   ) => {
  //     const chunk = rows.slice(startIndex, startIndex + chunkSize);
  //     let localConsecutiveFailures = currentConsecutiveFailures;

  //     console.log(
  //       `[chunk] START index=${startIndex}, size=${chunk.length}, alreadyCompleted=${completed}`,
  //     );

  //     for (let index = 0; index < chunk.length; index++) {
  //       const row = chunk[index];
  //       const certificateId = clientUniqueId();

  //       console.log(
  //         `[row] START rowIndex=${startIndex + index}, rowId=${row.id}, certId=${certificateId}`,
  //       );

  //       try {
  //         // 🔹 Step 1: Generate
  //         const generationResult = await generateCertificate({
  //           rowId: row.id,
  //           id: certificateId,
  //           multiplier: 4,
  //         });
  //         console.log(`[row] generated cert`, {
  //           rowId: row.id,
  //           certId: certificateId,
  //           url: generationResult.url,
  //         });

  //         addUrl(generationResult.url);

  //         // 🔹 Step 2: Fetch blob
  //         const response = await fetch(generationResult.url);
  //         console.log(`[row] blob fetch status`, {
  //           rowId: row.id,
  //           certId: certificateId,
  //           status: response.status,
  //         });

  //         if (!response.ok) {
  //           throw new Error(
  //             `Failed to fetch blob: ${response.status} ${response.statusText}`,
  //           );
  //         }

  //         const blob = await response.blob();

  //         // 🔹 Step 3: Upload
  //         const formData = new FormData();
  //         formData.append(
  //           "file",
  //           blob,
  //           `${sanitizeFilename(generationResult.meta.recipientName)}_${certificateId}.png`,
  //         );
  //         formData.append("id", certificateId);
  //         formData.append("recipientName", generationResult.meta.recipientName);
  //         formData.append("recipientEmail", generationResult.meta.recipientEmail);

  //         console.log(`[row] UPLOADING`, {
  //           rowId: row.id,
  //           certId: certificateId,
  //           endpoint: "/api/certificates/upload",
  //         });

  //         const uploadResponse = await fetch("/api/certificates/upload", {
  //           method: "POST",
  //           body: formData,
  //         });

  //         console.log(`[row] upload response`, {
  //           rowId: row.id,
  //           certId: certificateId,
  //           status: uploadResponse.status,
  //         });

  //         if (!uploadResponse.ok) {
  //           throw new Error(`Upload failed: ${uploadResponse.status}`);
  //         }

  //         // 🔹 Step 4: Parse response
  //         let storageResult: StorageResult;
  //         try {
  //           storageResult = await uploadResponse.json();
  //         } catch (jsonErr) {
  //           throw new Error(
  //             `Failed to parse upload response JSON: ${String(jsonErr)}`,
  //           );
  //         }

  //         setTimeout(() => cleanupUrl(generationResult.url), 1000);

  //         const newCompleted = completed + index + 1;

  //         if (storageResult.success) {
  //           localConsecutiveFailures = 0;
  //           updateProgress(
  //             newCompleted,
  //             rows.length,
  //             storageResult,
  //             undefined,
  //             localConsecutiveFailures,
  //           );
  //           console.log(`[row] SUCCESS`, {
  //             rowId: row.id,
  //             certId: certificateId,
  //             fileId: storageResult.imageFileId,
  //             completed: newCompleted,
  //             total: rows.length,
  //           });
  //         } else {
  //           localConsecutiveFailures++;
  //           updateProgress(
  //             newCompleted,
  //             rows.length,
  //             storageResult,
  //             row.id,
  //             localConsecutiveFailures,
  //           );
  //           console.warn(`[row] FAILURE (upload result)`, {
  //             rowId: row.id,
  //             certId: certificateId,
  //             error: storageResult.error,
  //             completed: newCompleted,
  //           });
  //         }
  //       } catch (err) {
  //         console.error(`[row] ERROR`, {
  //           rowId: row.id,
  //           certId: certificateId,
  //           error: err,
  //         });
  //         localConsecutiveFailures++;
  //         const newCompleted = completed + index + 1;
  //         const errorResult: StorageResult = {
  //           certificateId,
  //           imageFileId: "",
  //           success: false,
  //           error: err instanceof Error ? err.message : String(err),
  //         };
  //         updateProgress(
  //           newCompleted,
  //           rows.length,
  //           errorResult,
  //           row.id,
  //           localConsecutiveFailures,
  //         );
  //       }
  //     }

  //     const shouldStop = localConsecutiveFailures >= MAX_CONSECUTIVE_FAILURES;

  //     console.log(`[chunk] DONE`, {
  //       startIndex,
  //       processed: chunk.length,
  //       completed: completed + chunk.length,
  //       failures: localConsecutiveFailures,
  //     });

  //     return {
  //       completed: completed + chunk.length,
  //       consecutiveFailures: localConsecutiveFailures,
  //       shouldStop,
  //     };
  //   },
  //   [generateCertificate, updateProgress, cleanupUrl, addUrl],
  // );

  const processChunk = useCallback(
    async (
      rows: typeof state.data,
      startIndex: number,
      chunkSize: number,
      completed: number,
      currentConsecutiveFailures: number,
    ) => {
      const chunk = rows.slice(startIndex, startIndex + chunkSize);

      console.log(`[chunk] starting index ${startIndex}, size ${chunk.length}`);

      // Run each row in parallel
      const results = await Promise.allSettled(
        chunk.map(async (row, idx) => {
          const certificateId = clientUniqueId();

          try {
            const generationResult = await generateCertificate({
              rowId: row.id,
              id: certificateId,
              multiplier: 4,
            });
            const blob = await (await fetch(generationResult.url)).blob();

            const formData = new FormData();
            formData.append(
              "file",
              blob,
              `${sanitizeFilename(generationResult.meta.recipientName)}_${certificateId}.png`,
            );
            formData.append("id", certificateId);
            formData.append(
              "recipientName",
              generationResult.meta.recipientName,
            );
            formData.append(
              "recipientEmail",
              generationResult.meta.recipientEmail,
            );

            const uploadResponse = await fetch("/api/certificates/upload", {
              method: "POST",
              body: formData,
            });
            const storageResult: StorageResult = await uploadResponse.json();

            updateProgress(completed + idx + 1, rows.length, storageResult);
            return storageResult;
          } catch (err) {
            const errorResult: StorageResult = {
              certificateId,
              imageFileId: "",
              success: false,
              error: err instanceof Error ? err.message : String(err),
            };
            updateProgress(
              completed + idx + 1,
              rows.length,
              errorResult,
              row.id,
            );
            return errorResult;
          }
        }),
      );

      console.log(`[chunk] finished index ${startIndex}, results:`, results);
      return {
        completed: completed + chunk.length,
        consecutiveFailures: currentConsecutiveFailures,
        shouldStop: false,
      };
    },
    [generateCertificate, updateProgress],
  );

  const startBatchGeneration = useCallback(async () => {
    if (!state.data.length) {
      setBatchState((prev) => ({ ...prev, isGenerating: false }));
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    resetToDefaults();

    try {
      const rows = state.data;
      let completed = 0;
      let consecutiveFailures = 0;

      console.log(
        `[batch] total rows: ${rows.length}, chunk size: ${CHUNK_SIZE}`,
      );

      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        console.log(`[batch] processing chunk`, i, "to", i + CHUNK_SIZE - 1);

        const result = await processChunk(
          rows,
          i,
          CHUNK_SIZE,
          completed,
          consecutiveFailures,
        );

        console.log(`[batch] chunk done`, { completed: result.completed });

        completed = result.completed;
        consecutiveFailures = result.consecutiveFailures;

        if (result.shouldStop) {
          console.error(`[batch] stopping early due to failure threshold`);
          setBatchState((prev) => ({ ...prev, isGenerating: false }));
          return;
        }

        if (i + CHUNK_SIZE < rows.length) {
          console.log(`[batch] waiting ${BATCH_DELAY}ms before next chunk...`);
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      }

      console.log(`[batch] finished all chunks`);
      setBatchState((prev) => ({ ...prev, isGenerating: false }));
    } catch (error) {
      console.error("Batch generation error:", error);
      setBatchState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, [state.data, resetToDefaults, processChunk]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (batchState.isGenerating) {
        e.preventDefault();
        e.returnValue =
          "Certificate generation in progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [batchState.isGenerating]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cleanupAllUrls();
    };
  }, [cleanupAllUrls]);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!batchState.isGenerating) {
        if (!open) cleanupAllUrls();
        setBatchState((prev) => ({ ...prev, isOpen: open }));
      }
    },
    [batchState.isGenerating, cleanupAllUrls],
  );

  return { batchState, startBatchGeneration, handleClose };
};
