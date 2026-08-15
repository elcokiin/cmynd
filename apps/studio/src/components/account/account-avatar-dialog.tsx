import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { ImageDropzone } from "@elcokiin/ui/image-dropzone";
import { OptimizedImage } from "@elcokiin/ui/optimized-image";
import { Input } from "@elcokiin/ui/input";
import { Label } from "@elcokiin/ui/label";
import { ImageIcon, Link2Icon, UserIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface AccountAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
        alt="Account avatar"
        layout="fullWidth"
        className="size-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

export function AccountAvatarDialog({
  open,
  onOpenChange,
}: AccountAvatarDialogProps) {
  const { handleError } = useErrorHandler();
  const uploadAvatar = useConvexImageUpload();
  const current = useQuery(api.authors.queries.getAccountImage);
  const updateAccountAvatar = useMutation(
    api.authors.mutations.updateAccountAvatar,
  );

  const [avatarUrl, setAvatarUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (open) {
      setAvatarUrl(current?.avatarUrl ?? "");
      setPendingFile(null);
      setPreviewUrl(current?.avatarUrl ?? "");
    }

    return () => {
      revokeObjectUrl();
      objectUrlRef.current = null;
    };
  }, [open, current?.avatarUrl]);

  const handleDrop = async (file: File) => {
    revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPendingFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let url = avatarUrl.trim();
      let storageId: string | undefined;

      if (pendingFile) {
        const result = await uploadAvatar(pendingFile);
        url = result.url;
        storageId = result.storageId;
      }

      await updateAccountAvatar({
        avatarUrl: url,
        avatarStorageId: url ? storageId : undefined,
      });

      revokeObjectUrl();
      toast.success("Account avatar updated");
      onOpenChange(false);
    } catch (error) {
      handleError(error, { context: "AccountAvatarDialog.handleSave" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    revokeObjectUrl();
    setAvatarUrl("");
    setPendingFile(null);
    setPreviewUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Account avatar</DialogTitle>
          <DialogDescription>
            Set the image shown for your account and author profile. Leaving it
            empty keeps the portfolio avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <AvatarPreview url={pendingFile ? previewUrl : avatarUrl} />

          <div className="grid gap-2">
            <Label htmlFor="account-avatar-url" className="text-sm font-medium">
              Upload
            </Label>
            <ImageDropzone
              onDrop={handleDrop}
              isUploading={isSaving && !!pendingFile}
              className="px-4 py-3"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="inline-flex items-center gap-1">
              <Link2Icon className="h-3 w-3" />
              or use a URL
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="account-avatar-url" className="text-sm font-medium">
              Image URL
            </Label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <ImageIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="account-avatar-url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  className="pl-8"
                  disabled={!!pendingFile}
                />
              </div>
              {(avatarUrl.trim() || pendingFile) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  aria-label="Remove avatar"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {(avatarUrl.trim() || pendingFile) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isSaving}
              className="w-full"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Remove avatar (use portfolio default)
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}