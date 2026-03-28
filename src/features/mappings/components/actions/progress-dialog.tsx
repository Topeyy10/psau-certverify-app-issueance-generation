// ProgressDialog.tsx
"use client";

import { forwardRef, useImperativeHandle } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useBatchGeneration } from "../../lib/hooks/use-batch-generation";
import type { ProgressDialogRef } from "../../lib/types";

const ProgressDialog = forwardRef<ProgressDialogRef>((_, ref) => {
  const { batchState, startBatchGeneration, handleClose } =
    useBatchGeneration();

  useImperativeHandle(
    ref,
    () => ({
      startUpload: startBatchGeneration,
    }),
    [startBatchGeneration],
  );

  // Find the last failed certificate
  const lastFailedCertificate = batchState.completedCertificates
    .slice()
    .reverse()
    .find((cert) => !cert.success);

  return (
    <AlertDialog open={batchState.isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {batchState.isGenerating
              ? "Generating Certificates"
              : "Generation Complete"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <div>
                Generated {batchState.completedCertificates.length} of{" "}
                {batchState.total} certificates.
              </div>
              {batchState.failedRows.length > 0 ? (
                <div>
                  <div className="text-destructive">
                    Failed: {batchState.failedRows.length} certificates
                  </div>
                  {lastFailedCertificate && (
                    <div className="text-destructive text-sm mt-1">
                      Last error:{" "}
                      {lastFailedCertificate.error || "Unknown error"}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  Successfully generated all {batchState.total} certificates.
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {batchState.isGenerating && (
          <div className="space-y-2">
            <Progress value={batchState.progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{batchState.completed} completed</span>
              <span>{batchState.total - batchState.completed} remaining</span>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogAction
            disabled={batchState.isGenerating}
            className="w-full"
          >
            {batchState.isGenerating ? "Generating..." : "Close"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

ProgressDialog.displayName = "ProgressDialog";

export { ProgressDialog };
