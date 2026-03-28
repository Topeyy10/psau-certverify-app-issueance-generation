"use client";

import { useCallback, useRef } from "react";
import { Dropzone } from "@/components/shared/dropzone";
import { CERTIFICATE_FILE } from "@/constants";
import { useVerify } from "../../hooks/use-verify";
import { useVerifyStore } from "../../store/verifyStore";

const UploadSlot = () => {
  const dropzoneRef = useRef<React.ComponentRef<typeof Dropzone> | null>(null);
  const processing = useVerifyStore((s) => s.processing);
  const { processImage, processPDF } = useVerify();

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        const file = files[0];
        if (file.name.endsWith(".pdf")) {
          await processPDF(file);
        } else if (file.name.endsWith(".png") || file.name.endsWith(".jpg")) {
          await processImage(file);
        }
      } catch (err) {
        dropzoneRef.current?.clearFiles();
      }
    },
    [processPDF, processImage],
  );

  return (
    <Dropzone
      accept={CERTIFICATE_FILE.ACCEPTED_TYPES}
      maxFiles={CERTIFICATE_FILE.MAX_FILE}
      maxSize={CERTIFICATE_FILE.MAX_FILE_SIZE}
      onFilesUpload={handleFileUpload}
      processing={processing}
      ref={dropzoneRef}
    />
  );
};

export { UploadSlot };
