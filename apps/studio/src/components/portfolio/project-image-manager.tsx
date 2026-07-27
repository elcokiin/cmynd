import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { ImageDropzone } from "@elcokiin/ui/image-dropzone";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ImageIcon, XIcon, PlusIcon, FileIcon } from "lucide-react";
import { compressImage } from "@/utils/compress-image";

import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

export type ImageEntry = {
  storageId?: string;
  url: string;
  alt?: string;
};

export type PendingFileEntry = {
  id: string;
  file: File;
  alt: string;
};

interface ProjectImageManagerProps {
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  pendingFiles: PendingFileEntry[];
  onPendingChange: (files: PendingFileEntry[]) => void;
  projectId?: Id<"projects">;
}

let pendingIdCounter = 0;

function ImagePreview({ url, alt }: { url: string; alt?: string }) {
  const [error, setError] = useState(false);
  if (!url.trim() || error) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
      <img
        src={url.trim()}
        alt={alt ?? "Preview"}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function ProjectImageManager({
  images,
  onChange,
  pendingFiles,
  onPendingChange,
  projectId,
}: ProjectImageManagerProps) {
  const { handleError } = useErrorHandler();
  const removeProjectImage = useMutation(
    api.portfolio.mutations.removeProjectImage,
  );
  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const getOrCreatePreviewUrl = useCallback(
    (fileId: string, file: File): string => {
      let url = objectUrlsRef.current.get(fileId);
      if (!url) {
        url = URL.createObjectURL(file);
        objectUrlsRef.current.set(fileId, url);
      }
      return url;
    },
    [],
  );

  const revokePreviewUrl = useCallback((fileId: string) => {
    const url = objectUrlsRef.current.get(fileId);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(fileId);
    }
  }, []);

  const handleDrop = useCallback(
    async (file: File) => {
      const compressionResult = await compressImage(file);
      if (!compressionResult.ok) {
        if (compressionResult.reason === "too-large") {
          toast.error("Image too large. Maximum size is 10MB.");
        } else {
          toast.error("Failed to process image. Try a different file.");
        }
        return;
      }

      const id = `pending_${++pendingIdCounter}`;
      onPendingChange([
        ...pendingFiles,
        { id, file: compressionResult.file, alt: "" },
      ]);
    },
    [pendingFiles, onPendingChange],
  );

  const handleRemoveSaved = useCallback(
    async (index: number) => {
      const image = images[index];
      if (!image) return;

      if (image.storageId && projectId) {
        try {
          await removeProjectImage({ projectId, storageId: image.storageId });
        } catch (error) {
          handleError(error, {
            context: "ProjectImageManager.handleRemoveSaved",
          });
          return;
        }
      }

      const updated = images.filter((_, i) => i !== index);
      onChange(updated);
    },
    [images, projectId, removeProjectImage, onChange, handleError],
  );

  const handleRemovePending = useCallback(
    (index: number) => {
      const file = pendingFiles[index];
      if (!file) return;
      revokePreviewUrl(file.id);
      const updated = pendingFiles.filter((_, i) => i !== index);
      onPendingChange(updated);
    },
    [pendingFiles, onPendingChange, revokePreviewUrl],
  );

  const handleUrlChange = useCallback(
    (index: number, url: string) => {
      const updated = images.map((img, i) =>
        i === index ? { ...img, url } : img,
      );
      onChange(updated);
    },
    [onChange],
  );

  const handleSavedAltChange = useCallback(
    (index: number, alt: string) => {
      const updated = images.map((img, i) =>
        i === index ? { ...img, alt: alt || undefined } : img,
      );
      onChange(updated);
    },
    [onChange],
  );

  const handlePendingAltChange = useCallback(
    (index: number, alt: string) => {
      const updated = pendingFiles.map((pf, i) =>
        i === index ? { ...pf, alt } : pf,
      );
      onPendingChange(updated);
    },
    [pendingFiles, onPendingChange],
  );

  const addUrlEntry = useCallback(() => {
    onChange([...images, { url: "", alt: "" }]);
  }, [images, onChange]);

  return (
    <div className="grid gap-2">
      <Label>Images</Label>
      <div className="space-y-3">
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Saved Images
            </p>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative group rounded-lg border bg-muted/30 overflow-hidden"
                >
                  <ImagePreview url={img.url} alt={img.alt} />
                  <div className="p-2 space-y-1.5">
                    <div className="flex gap-1.5 items-center">
                      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Input
                        placeholder="Image URL"
                        value={img.url}
                        onChange={(e) => handleUrlChange(i, e.target.value)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <Input
                      placeholder="Alt text (optional)"
                      value={img.alt ?? ""}
                      onChange={(e) => handleSavedAltChange(i, e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 size-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                    onClick={() => handleRemoveSaved(i)}
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {pendingFiles.map((pf, i) => {
                const previewUrl = getOrCreatePreviewUrl(pf.id, pf.file);
                return (
                  <div
                    key={pf.id}
                    className="relative rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 overflow-hidden"
                  >
                    <ImagePreview url={previewUrl} alt={pf.alt} />
                    <div className="p-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {pf.file.name}
                        </span>
                      </div>
                      <Input
                        placeholder="Alt text (optional)"
                        value={pf.alt}
                        onChange={(e) =>
                          handlePendingAltChange(i, e.target.value)
                        }
                        className="h-7 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-7 text-muted-foreground hover:text-destructive bg-background/80"
                      onClick={() => handleRemovePending(i)}
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ImageDropzone
          onDrop={handleDrop}
          hint="Images are compressed to JPEG, max 10MB"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUrlEntry}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add External URL
        </Button>
      </div>
    </div>
  );
}
