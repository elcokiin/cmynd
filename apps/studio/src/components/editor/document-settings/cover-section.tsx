import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ImageIcon,
  SparklesIcon,
  TextIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { useErrorHandler } from "@/hooks/use-error-handler";

type CoverConfigTab = "image" | "prompt" | "description";

type CoverSectionProps = {
  documentId: Id<"documents">;
};

export function CoverSection({ documentId }: CoverSectionProps) {
  const [activeCoverTab, setActiveCoverTab] = useState<CoverConfigTab>("image");
  const [coverImagePrompt, setCoverImagePrompt] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const coverImageUrl = useQuery(
    api.storage.getUrl,
    document?.coverImageId ? { storageId: document.coverImageId } : "skip",
  );

  const updateCoverImage = useMutation(api.documents.mutations.updateCoverImage);
  const updateMetadata = useMutation(api.documents.mutations.updateMetadata);
  const deleteFile = useMutation(api.storage.deleteFile);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  useEffect(() => {
    if (!document) return;
    setCoverImagePrompt(document.coverImagePrompt ?? "");
    setDescription(document.description ?? "");
  }, [document]);

  const normalizeOptionalText = (value: string): string | undefined => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const saveMetadataDebounced = useDebouncedCallback(
    async (field: "coverImagePrompt" | "description", value: string) => {
      try {
        const normalized = normalizeOptionalText(value);
        if (field === "coverImagePrompt") {
          await updateMetadata({
            documentId,
            coverImagePrompt: normalized,
          });
          return;
        }
        await updateMetadata({
          documentId,
          description: normalized,
        });
      } catch (error) {
        handleError(error, {
          context: `CoverSection.saveMetadata.${field}`,
        });
      }
    },
    700,
  );

  useEffect(() => {
    return () => {
      saveMetadataDebounced.flush();
    };
  }, [saveMetadataDebounced]);

  const handlePromptChange = (value: string) => {
    setCoverImagePrompt(value);
    saveMetadataDebounced("coverImagePrompt", value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveMetadataDebounced("description", value);
  };

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
        context: "CoverSection.handleImageUpload",
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
        context: "CoverSection.handleRemoveCoverImage",
      });
    }
  };

  const tabs: { id: CoverConfigTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "prompt", label: "Prompt", icon: SparklesIcon },
    { id: "description", label: "Description", icon: TextIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Cover Image</h3>
        <p className="text-sm text-muted-foreground">
          Add a cover image that will be displayed on your document
          card. A cover image is required to submit for review.
        </p>
      </div>

      <div className="inline-flex items-center rounded-md border bg-muted/20 p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCoverTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors",
                activeCoverTab === tab.id
                  ? "bg-background shadow-sm font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeCoverTab === "image" && (
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
      )}

      {activeCoverTab === "prompt" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Coming soon: auto-generated prompts and image generation
            inside the blog. Save the prompt used to generate this
            image.
          </p>
          <textarea
            value={coverImagePrompt}
            onChange={(event) => handlePromptChange(event.target.value)}
            placeholder="e.g. cinematic street photo, golden hour, 50mm lens, high detail"
            className={cn(
              "w-full min-h-[220px] p-3 text-sm rounded-md border resize-y",
              "bg-background placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            )}
          />
        </div>
      )}

      {activeCoverTab === "description" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Add a short summary for this document. Optional.
          </p>
          <textarea
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            placeholder="Write a concise summary of what this document covers..."
            className={cn(
              "w-full min-h-[220px] p-3 text-sm rounded-md border resize-y",
              "bg-background placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            )}
          />
        </div>
      )}
    </div>
  );
}
