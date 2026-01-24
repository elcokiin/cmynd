import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";

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
import { Label } from "@elcokiin/ui/label";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ImagePlusIcon, XIcon, ImageIcon } from "lucide-react";

import { documentTypeConfig } from "@/components/dashboard/document-type-config";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useQuery } from "convex/react";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  currentType: DocumentType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DocumentSettingsDialog({
  documentId,
  currentType,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps): React.ReactNode {
  const [type, setType] = useState<DocumentType>(currentType);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleError } = useErrorHandler();
  const uploadFn = useConvexImageUpload();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const coverImageUrl = useQuery(api.storage.getUrl, 
    document?.coverImageId ? { storageId: document.coverImageId } : "skip"
  );

  const updateType = useMutation(api.documents.mutations.updateType);
  const updateCoverImage = useMutation(api.documents.mutations.updateCoverImage);
  const deleteFile = useMutation(api.storage.deleteFile);

  const handleSave = async () => {
    if (type === currentType) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateType({ documentId, type });
      toast.success("Document settings updated");
      onOpenChange(false);
    } catch (error) {
      handleError(error, { context: "DocumentSettingsDialog.handleSave" });
    } finally {
      setIsSaving(false);
    }
  };

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    try {
      // Delete existing cover image if any
      if (document?.coverImageId) {
        await deleteFile({ storageId: document.coverImageId });
      }

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();
      
      await updateCoverImage({
        documentId,
        coverImageId: storageId as Id<"_storage">,
      });
      
      toast.success("Cover image updated");
    } catch (error) {
      handleError(error, { context: "DocumentSettingsDialog.handleImageUpload" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCoverImage = async () => {
    if (!document?.coverImageId) return;

    try {
      await deleteFile({ storageId: document.coverImageId });
      await updateCoverImage({
        documentId,
        coverImageId: undefined,
      });
      toast.success("Cover image removed");
    } catch (error) {
      handleError(error, { context: "DocumentSettingsDialog.handleRemoveCoverImage" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
          <DialogDescription>
            Configure your document type and cover image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Cover Image</Label>
            <div className="border rounded-lg p-4 space-y-4">
              {coverImageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={handleRemoveCoverImage}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/50 hover:bg-muted/70 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="rounded-full bg-background p-3 shadow-sm">
                    {isUploading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {isUploading ? "Uploading..." : "Click to upload cover image"}
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Document Type</Label>
            <div className="grid grid-cols-1 gap-2">

              {(
                Object.entries(documentTypeConfig) as [
                  DocumentType,
                  (typeof documentTypeConfig)[DocumentType],
                ][]
              ).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-colors",
                      type === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
