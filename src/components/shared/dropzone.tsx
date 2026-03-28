"use client";

import {
  FileSpreadsheetIcon,
  Loader2Icon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  type FileRejection,
  type DropzoneOptions as ReactDropzoneProps,
  useDropzone,
} from "react-dropzone";
import { toast } from "sonner";
import { cn, formatFileSize } from "@/lib/utils";

type DropzoneOptions = Omit<
  ReactDropzoneProps,
  "onDrop" | "onDropAccepted" | "onDropRejected"
>;

interface DropzoneWrapperProps extends DropzoneOptions {
  label?: string | React.ReactElement;
  subtitle?: string | React.ReactElement;
  className?: string;
  onFilesUpload?: (files: File[]) => void;
  onFilesRemove?: () => void;
  processing?: boolean;
}

export interface DropzoneRef {
  clearFiles: () => void;
}

const baseClassName =
  "cursor-pointer flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-4 py-8 transition h-full";

interface UploadedBlockProps {
  files: File[];
  processing?: boolean;
  className?: string;
  onClick: () => void;
}

const UploadedBlock = React.memo(
  ({ files, processing, className, onClick }: UploadedBlockProps) => {
    const uploadedClassName = cn(
      baseClassName,
      processing && "bg-muted cursor-not-allowed",
      "group relative w-full",
      className,
    );

    return (
      <button type="button" className={uploadedClassName} onClick={onClick}>
        <div className="bg-muted/50 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-full items-center justify-center">
            <Trash2Icon className="text-destructive size-10" />
          </div>
        </div>
        <FileSpreadsheetIcon className="size-9" />
        <div className="text-center">
          <p className="line-clamp-1 text-sm text-pretty">
            {files.length === 1
              ? files[0].name
              : `${files.length} files uploaded`}
          </p>
          <p className="text-muted-foreground text-xs">
            {files.length === 1 ? formatFileSize(files[0].size) : "-"}
          </p>
        </div>
      </button>
    );
  },
);

const Dropzone = forwardRef<DropzoneRef, DropzoneWrapperProps>((props, ref) => {
  const {
    label,
    subtitle,
    className,
    processing,
    onFilesUpload,
    onFilesRemove,
    ...dropzoneOptions
  } = props;

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleClearFiles = useCallback(() => {
    if (!processing) {
      setUploadedFiles([]);
      onFilesRemove?.();
    }
  }, [onFilesRemove, processing]);

  useImperativeHandle(ref, () => ({ clearFiles: handleClearFiles }), [
    handleClearFiles,
  ]);

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const maxFiles = dropzoneOptions.maxFiles ?? 1;
      const totalFiles = acceptedFiles.length + fileRejections.length;
      if (totalFiles > maxFiles) {
        toast.error("File upload failed", {
          description: `Please select a maximum of ${maxFiles} file(s) to continue.`,
          classNames: { title: "!font-bold" },
        });
        return;
      }

      if (fileRejections.length > 0) {
        fileRejections.forEach(({ file, errors }) => {
          errors.forEach((err) => {
            toast.error(`File "${file.name}" rejected`, {
              description: err.message,
              classNames: { title: "!font-bold" },
            });
          });
        });
      }

      if (acceptedFiles.length > 0) {
        setUploadedFiles(acceptedFiles);
        onFilesUpload?.(acceptedFiles);
      }
    },
    [dropzoneOptions.maxFiles, onFilesUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneOptions,
    onDrop: handleDrop,
    disabled: processing,
  });

  const acceptedFormats = useMemo(
    () =>
      dropzoneOptions.accept
        ? Object.values(dropzoneOptions.accept).flat().join(", ")
        : null,
    [dropzoneOptions.accept],
  );

  const rootClassName = useMemo(
    () =>
      cn(
        baseClassName,
        isDragActive && "border-primary bg-muted",
        processing && "bg-muted cursor-not-allowed",
        className,
      ),
    [isDragActive, processing, className],
  );

  const centerContent = useMemo(() => {
    if (isDragActive)
      return <p className="text-center text-sm">Drop the file to upload</p>;
    if (processing)
      return <p className="text-sm text-pretty">Processing, please wait.</p>;
    if (label) {
      return typeof label === "string" ? (
        <p className="text-sm text-pretty">{label}</p>
      ) : (
        label
      );
    }
    return (
      <p className="text-sm text-pretty">
        <span className="font-medium">Click to upload</span> or drag and drop
      </p>
    );
  }, [isDragActive, processing, label]);

  const subtitleContent = useMemo(() => {
    if (!subtitle && !acceptedFormats) return null;
    if (subtitle) {
      return typeof subtitle === "string" ? (
        <p className="text-xs text-pretty">{subtitle}</p>
      ) : (
        subtitle
      );
    }
    return <p className="text-xs">Supports {acceptedFormats}</p>;
  }, [subtitle, acceptedFormats]);

  if (uploadedFiles.length > 0) {
    return (
      <UploadedBlock
        files={uploadedFiles}
        processing={processing}
        className={className}
        onClick={handleClearFiles}
      />
    );
  }

  return (
    <div {...getRootProps()} className={rootClassName}>
      <input {...getInputProps()} />
      {processing ? (
        <Loader2Icon className="text-muted-foreground size-9 animate-spin" />
      ) : (
        <UploadIcon className="text-muted-foreground size-9" />
      )}
      <div className="text-muted-foreground text-center">
        {centerContent}
        {subtitleContent}
      </div>
    </div>
  );
});

export { Dropzone };
