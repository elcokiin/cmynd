import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { DocumentType } from "@elcokiin/backend/lib/types/documents";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@elcokiin/ui/dialog";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  XIcon,
  ImageIcon,
  BookOpenIcon,
  LinkIcon,
  DownloadIcon,
  SettingsIcon,
} from "lucide-react";

import { useErrorHandler } from "@/hooks/use-error-handler";

type DocumentSettingsDialogProps = {
  documentId: Id<"documents">;
  currentType?: DocumentType;
  onExportMarkdown?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type NavigationSection = "cover" | "curate" | "references" | "export";

export function DocumentSettingsDialog({
  documentId,
  onExportMarkdown,
  open,
  onOpenChange,
}: DocumentSettingsDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("cover");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const coverImageUrl = useQuery(
    api.storage.getUrl,
    document?.coverImageId ? { storageId: document.coverImageId } : "skip",
  );

  const updateCoverImage = useMutation(
    api.documents.mutations.updateCoverImage,
  );
  const deleteFile = useMutation(api.storage.deleteFile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      handleError(error, {
        context: "DocumentSettingsDialog.handleImageUpload",
      });
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
      handleError(error, {
        context: "DocumentSettingsDialog.handleRemoveCoverImage",
      });
    }
  };

  const navItems = [
    { id: "cover" as const, label: "Cover", icon: ImageIcon },
    { id: "curate" as const, label: "Curate", icon: BookOpenIcon },
    { id: "references" as const, label: "References", icon: LinkIcon },
    ...(onExportMarkdown
      ? [{ id: "export" as const, label: "Export", icon: DownloadIcon }]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex min-h-[400px]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r bg-muted/30 p-4 flex flex-col gap-1">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-sm font-medium">
                Settings
              </DialogTitle>
            </DialogHeader>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                    activeSection === item.id
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === "cover" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Cover Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a cover image that will be displayed on your document
                    card. A cover image is required to submit for review.
                  </p>
                </div>

                <div className="space-y-4">
                  {coverImageUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
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
                      className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 hover:bg-muted/70 transition-colors"
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
                        {isUploading
                          ? "Uploading..."
                          : "Click to upload cover image"}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        Recommended: 1200 x 630 pixels
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
            )}

            {activeSection === "curate" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Curate</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure curation settings for your document.
                  </p>
                </div>
                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <BookOpenIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      This feature is still being built.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "references" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">References</h3>
                  <p className="text-sm text-muted-foreground">
                    Add references and sources for your document.
                  </p>
                </div>
                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      This feature is still being built.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "export" && onExportMarkdown && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Download your document as a Markdown file.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={onExportMarkdown}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export as .md
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ButtonSettingsProps = {
  documentId: Id<"documents"> | null;
  currentType?: DocumentType;
  onExportMarkdown?: () => void;
};

export function ButtonSettings({
  documentId,
  onExportMarkdown,
}: ButtonSettingsProps): React.ReactNode {
  const [open, setOpen] = useState(false);

  const isDisabled = !documentId;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        title={isDisabled ? "Save document first" : "Document settings"}
      >
        <SettingsIcon className="h-4 w-4" />
      </Button>
      {documentId && (
        <DocumentSettingsDialog
          documentId={documentId}
          onExportMarkdown={onExportMarkdown}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
