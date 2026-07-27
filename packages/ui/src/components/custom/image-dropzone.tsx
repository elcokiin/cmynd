import { UploadIcon } from "lucide-react";
import { type JSX, type ReactNode, useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "../../lib/utils";

type ImageDropzoneProps = {
  onDrop: (file: File) => void | Promise<void>;
  isUploading?: boolean;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  hint?: string;
  aspectRatio?: "video" | "none";
  className?: string;
  children?: ReactNode;
};

export function ImageDropzone({
  onDrop,
  isUploading = false,
  disabled = false,
  accept = { "image/*": [] },
  maxFiles = 1,
  hint,
  aspectRatio = "none",
  className,
  children,
}: ImageDropzoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) onDrop(file);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    disabled: disabled || isUploading,
    noClick: false,
    noKeyboard: false,
  });

  const dropzoneRootProps =
    getRootProps() as JSX.IntrinsicElements["div"];

  return (
    <div
      {...dropzoneRootProps}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all duration-200",
        aspectRatio === "video"
          ? "aspect-video w-full"
          : "p-6",
        isDragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/40 hover:bg-muted/70",
        (disabled || isUploading) && "pointer-events-none opacity-60",
        className,
      )}
    >
      <input {...getInputProps()} aria-label="Upload image" />
      {children ?? (
        <>
          <div
            className={cn(
              "rounded-full p-3 shadow-sm transition-all duration-200",
              isDragActive ? "bg-primary/10 scale-110" : "bg-background",
            )}
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <UploadIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isDragActive ? "text-primary" : "text-muted-foreground",
                )}
              />
            )}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {isUploading
              ? "Uploading..."
              : isDragActive
                ? "Drop your image here"
                : "Drag & drop or click to upload"}
          </div>
          {hint && (
            <div className="text-xs text-muted-foreground/70">{hint}</div>
          )}
          {isDragActive && (
            <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background" />
          )}
        </>
      )}
    </div>
  );
}
