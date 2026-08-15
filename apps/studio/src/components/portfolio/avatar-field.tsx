import { useEffect, useRef, useState } from "react";
import { ImageIcon, Link2Icon, UserIcon, XIcon } from "lucide-react";
import { Button } from "@elcokiin/ui/button";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { ImageDropzone } from "@elcokiin/ui/image-dropzone";
import { OptimizedImage } from "@elcokiin/ui/optimized-image";
import { cn } from "@elcokiin/ui/lib/utils";

export type AvatarValue = {
  url: string;
  storageId?: string;
};

interface AvatarFieldProps {
  value: AvatarValue;
  onChange: (value: AvatarValue) => void;
  pendingFile: File | null;
  onFileStage: (file: File | null) => void;
  isUploading?: boolean;
}

function AvatarPreview({ url }: { url: string }) {
  const [error, setError] = useState(false);
  const trimmed = url.trim();

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!trimmed || error) {
    return (
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full border border-dashed bg-muted">
        <UserIcon className="h-8 w-8 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-full border bg-muted">
      <OptimizedImage
        src={trimmed}
        alt="Avatar preview"
        layout="fullWidth"
        className="size-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function AvatarField({
  value,
  onChange,
  pendingFile,
  onFileStage,
  isUploading = false,
}: AvatarFieldProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      revokeObjectUrl();
    };
  }, []);

  const handleDrop = (file: File) => {
    revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onFileStage(file);
  };

  const handleClear = () => {
    revokeObjectUrl();
    setPreviewUrl("");
    onFileStage(null);
    onChange({ url: "", storageId: undefined });
  };

  const preview = pendingFile ? previewUrl : value.url;

  return (
    <div className="grid gap-3">
      <Label>Avatar</Label>
      <div className="flex items-start gap-4">
        <AvatarPreview url={preview} />

        <div className="min-w-0 flex-1 space-y-3">
          <ImageDropzone
            onDrop={handleDrop}
            isUploading={isUploading}
            className={cn(
              "px-4 py-3",
              (pendingFile || value.url.trim()) && "border-primary/40",
            )}
          />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="inline-flex items-center gap-1">
              <Link2Icon className="h-3 w-3" />
              or use a URL
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <ImageIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={value.url}
                onChange={(e) => {
                  if (pendingFile) {
                    handleClear();
                  }
                  onChange({ url: e.target.value });
                }}
                placeholder="https://example.com/avatar.jpg"
                type="url"
                className="pl-8"
              />
            </div>
            {(value.url.trim() || pendingFile) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                aria-label="Remove avatar"
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}