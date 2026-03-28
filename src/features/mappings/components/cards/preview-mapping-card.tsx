"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoadingButton } from "@/components/shared/loading-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useData } from "../../lib/contexts/data-provider";
import { usePreviewUrl } from "../../lib/hooks";
import type { ProgressDialogRef } from "../../lib/types";
import { ProgressDialog } from "../actions/";
import { MappingCardWrapper } from "../layout";

const Preview = () => {
  const { state, generateCertificate } = useData();
  const [previewUrl, setPreviewUrl] = usePreviewUrl();
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    error: null as string | null,
    lastRowId: null as string | null,
  });
  const [showAlert, setShowAlert] = useState(false);

  const batchGenerationRef = useRef<ProgressDialogRef | null>(null);

  const canGenerate = Boolean(
    state.activeRowId && !generationState.isGenerating,
  );
  const canBatchGenerate = Boolean(
    state.data.length && !generationState.isGenerating,
  );

  const handleGeneratePreview = useCallback(
    async (isAutoGeneration = false) => {
      if (!state.activeRowId || generationState.isGenerating) return;

      const currentRowId = state.activeRowId;

      setGenerationState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        lastRowId: currentRowId,
      }));

      // Clear existing preview when switching rows or manually regenerating
      if (!isAutoGeneration || generationState.lastRowId !== currentRowId) {
        setPreviewUrl(null);
      }

      try {
        const { url } = await generateCertificate({
          rowId: currentRowId,
          multiplier: 2,
        });

        // Check if row changed during generation (race condition protection)
        if (currentRowId !== state.activeRowId) {
          // Row changed during generation, cleanup the URL
          try {
            URL.revokeObjectURL(url);
          } catch (err) {
            console.warn("Failed to revoke stale URL:", err);
          }
          return;
        }

        setPreviewUrl(url);
        setGenerationState((prev) => ({
          ...prev,
          isGenerating: false,
          error: null,
        }));
      } catch (error) {
        // Only update error if we're still on the same row
        if (currentRowId === state.activeRowId) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to generate preview";
          setGenerationState((prev) => ({
            ...prev,
            isGenerating: false,
            error: message,
          }));
          console.error("Preview generation error:", error);
        }
      }
    },
    [
      state.activeRowId,
      generateCertificate,
      generationState.isGenerating,
      generationState.lastRowId,
      setPreviewUrl,
    ],
  );

  useEffect(() => {
    // Handle row changes - reset error state and clear preview
    if (state.activeRowId !== generationState.lastRowId && state.activeRowId) {
      setGenerationState((prev) => ({
        ...prev,
        error: null,
      }));

      // Clear preview when row changes
      setPreviewUrl(null);

      // Auto-generate for new row if not loading and not currently generating
      if (!state.loading && !generationState.isGenerating) {
        handleGeneratePreview(true);
      }
    }
  }, [
    state.activeRowId,
    state.loading,
    generationState.lastRowId,
    generationState.isGenerating,
    handleGeneratePreview,
    setPreviewUrl,
  ]);

  const handleManualGenerate = useCallback(() => {
    handleGeneratePreview(false);
  }, [handleGeneratePreview]);

  const handleBatchGenerate = useCallback(() => {
    setShowAlert(true);
  }, []);

  const handleAlertConfirm = useCallback(() => {
    setShowAlert(false);
    batchGenerationRef.current?.startUpload();
  }, []);

  return (
    <>
      <MappingCardWrapper group="livePreview" className="space-y-2">
        {previewUrl ? (
          <ImageZoom>
            <div className="aspect-video overflow-hidden rounded-sm border bg-secondary">
              <Image
                width={200}
                height={150}
                className="h-full w-full object-contain shadow"
                src={previewUrl}
                alt="Template preview"
                draggable={false}
              />
            </div>
          </ImageZoom>
        ) : (
          <div className="aspect-video overflow-hidden rounded-sm border bg-secondary relative" />
        )}

        <LoadingButton
          onClick={handleManualGenerate}
          disabled={!canGenerate}
          className="w-full"
          variant={generationState.error ? "destructive" : "default"}
          showLoader
          loading={generationState.isGenerating || state.loading}
          loadingLabel="Generating"
          label={generationState.error ? "Retry Generate" : "Generate Preview"}
        />

        <Button
          className="w-full"
          variant="secondary"
          disabled={!canBatchGenerate}
          onClick={handleBatchGenerate}
        >
          Generate Certificates
        </Button>
      </MappingCardWrapper>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ready to generate certificates?</AlertDialogTitle>
            <AlertDialogDescription>
              A unique certificate will be created for each entry you've added.
              They will be saved and ready for you to manually issue from the
              Certificates page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleAlertConfirm}>Generate</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProgressDialog ref={batchGenerationRef} />
    </>
  );
};

export { Preview };
