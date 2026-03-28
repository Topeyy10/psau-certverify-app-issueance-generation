"use client";

import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { AlertCircleIcon, Loader2Icon, RotateCcwIcon } from "lucide-react";
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useScanner } from "../../hooks/use-scanner";
import { useVerify } from "../../hooks/use-verify";
import { useVerifyStore } from "../../store/verifyStore";
import { CameraSelector } from "./camera-selector";

const ScannerSlot = ({
  button,
}: {
  button: React.ReactElement<React.ComponentProps<"button">>;
}) => {
  const processing = useVerifyStore((s) => s.processing);
  const { processID } = useVerify();

  const {
    isActive,
    isInitializing,
    error,
    startScanner,
    stopScanner,
    refreshCameras,
    clearError,
    ...cameraConfig
  } = useScanner(processID, "qr-reader");

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      clearError();
      stopScanner();
    }
  };

  return (
    <>
      {React.cloneElement(button, {
        onClick: startScanner,
        disabled: isInitializing || processing,
        children: isInitializing ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Initializing...
          </>
        ) : (
          button.props.children
        ),
      })}

      <Dialog open={isActive} onOpenChange={handleDialogClose}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>QR Code Verification</DialogTitle>
            <DialogDescription>
              Align your certificate's QR code within the frame to confirm its
              validity.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <CameraSelector isInitializing={isInitializing} {...cameraConfig} />

          <div className="relative">
            <div
              id="qr-reader"
              className="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-900"
            ></div>

            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-neutral-100">
                  <Loader2Icon className="size-8 animate-spin" />
                  <span className="text-sm">Initializing camera...</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {error && (
              <Button
                variant="outline"
                onClick={() => {
                  clearError();
                  startScanner();
                }}
                disabled={isInitializing}
              >
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={refreshCameras}
              disabled={isInitializing}
            >
              <RotateCcwIcon className="mr-2 size-4" />
              Refresh Cameras
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ScannerSlot };
