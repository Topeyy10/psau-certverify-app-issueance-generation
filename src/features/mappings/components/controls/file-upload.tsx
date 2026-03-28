"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Dropzone } from "@/components/shared/dropzone";
import { MAPPING_FILE } from "@/constants";
import { useAppActions } from "../../lib/hooks";
import { parseFile } from "../../lib/utils";

const FileUpload = () => {
  const { setData, clearData } = useAppActions();

  const [isLoading, setIsLoading] = useState(false);

  const handleFileDrop = useCallback(
    async (file: File[]) => {
      const selectedFile = file[0];
      if (!selectedFile) return;
      setIsLoading(true);

      try {
        const parsedData = await parseFile(selectedFile);
        setData(parsedData);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to parse file",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setData],
  );

  return (
    <>
      <Dropzone
        accept={MAPPING_FILE.ACCEPTED_TYPES}
        className="py-15 mb-1"
        maxFiles={MAPPING_FILE.MAX_FILE}
        maxSize={MAPPING_FILE.MAX_FILE_SIZE}
        onFilesRemove={clearData}
        onFilesUpload={handleFileDrop}
        processing={isLoading}
      />
      <p className="text-xs text-muted-foreground">
        The first row of your uploaded file will be automatically used as column
        headers for mapping. Data in this row will not be included in the
        import.
      </p>
    </>
  );
};

export { FileUpload };
