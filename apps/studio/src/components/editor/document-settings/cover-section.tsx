import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { Textarea } from "@elcokiin/ui/textarea";
import { cn } from "@elcokiin/ui/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { ImageDropzone } from "@elcokiin/ui/image-dropzone";
import { OptimizedImage } from "@elcokiin/ui/optimized-image";
import {
  ImageIcon,
  SparklesIcon,
  TextIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { useDebouncedSave } from "@/hooks/use-debounced-save";
import { normalizeOptionalText } from "@/lib/text";
import { compressImage } from "@/utils/compress-image";

type CoverConfigTab = "image" | "prompt" | "description";

type CoverSectionProps = {
  documentId: Id<"documents">;
};

export function CoverSection({ documentId }: CoverSectionProps) {
  const [activeCoverTab, setActiveCoverTab] = useState<CoverConfigTab>("image");
  const [coverImagePrompt, setCoverImagePrompt] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const initializedRef = useRef(false);

  const { handleError } = useErrorHandler();

  const document = useQuery(api.documents.queries.getForEdit, { documentId });
  const coverImageUrl = useQuery(
    api.storage.getCdnUrl,
    document?.coverImage?.storageId ? { key: document.coverImage.storageId } : "skip",
  );

  const updateCoverImage = useMutation(api.documents.mutations.updateCoverImage);
  const updateMetadata = useMutation(api.documents.mutations.updateMetadata);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  useEffect(() => {
    if (!document) return;
    if (initializedRef.current) return;
    initializedRef.current = true;
    setCoverImagePrompt(document.coverImage?.prompt ?? "");
    setDescription(document.description ?? "");
  }, [document]);

  const saveCoverImage = useDebouncedSave(async () => {
    try {
      await updateCoverImage({
        documentId,
        coverImage: {
          storageId: document?.coverImage?.storageId,
          prompt: normalizeOptionalText(coverImagePrompt),
        },
      });
    } catch (error) {
      handleError(error, {
        context: "CoverSection.saveCoverImage",
      });
    }
  }, 700);

  const saveDescription = useDebouncedSave(async () => {
    try {
      await updateMetadata({
        documentId,
        description: normalizeOptionalText(description),
      });
    } catch (error) {
      handleError(error, {
        context: "CoverSection.saveDescription",
      });
    }
  }, 700);

  const handlePromptChange = (value: string) => {
    setCoverImagePrompt(value);
    saveCoverImage();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    saveDescription();
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const compressionResult = await compressImage(file);

      if (!compressionResult.ok) {
        if (compressionResult.reason === "too-large") {
          toast.error("Image too large. Maximum size is 10MB.");
        } else {
          toast.error("Failed to process image. Try a different file.");
        }
        return;
      }

      const { key, url } = await generateUploadUrl();
      const uploadResult = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": compressionResult.file.type },
        body: compressionResult.file,
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.statusText}`);
      }

      await updateCoverImage({
        documentId,
        coverImage: {
          storageId: key,
          prompt: normalizeOptionalText(coverImagePrompt) || undefined,
        },
      });

      toast.success("Cover image updated");
    } catch (error) {
      handleError(error, {
        context: "CoverSection.handleImageUpload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCoverImage = async () => {
    if (!document?.coverImage?.storageId) return;
    try {
      await updateCoverImage({ documentId, coverImage: undefined });
      toast.success("Cover image removed");
    } catch (error) {
      handleError(error, { context: "CoverSection.handleRemoveCoverImage" });
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
              <OptimizedImage
                src={coverImageUrl}
                alt="Cover"
                layout="fullWidth"
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={handleRemoveCoverImage}
                aria-label="Remove cover image"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <ImageDropzone
              onDrop={handleImageUpload}
              isUploading={isUploading}
              aspectRatio="video"
              hint="Recommended: 735 × 490 px"
            />
          )}
        </div>
      )}

      {activeCoverTab === "prompt" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Coming soon: auto-generated prompts and image generation
            inside the blog. Save the prompt used to generate this
            image.
          </p>
          <label htmlFor="cover-prompt" className="sr-only">Cover image prompt</label>
          <Textarea
            id="cover-prompt"
            value={coverImagePrompt}
            onChange={(event) => handlePromptChange(event.target.value)}
            placeholder="e.g. cinematic street photo, golden hour, 50mm lens, high detail"
            className="min-h-[220px] resize-y"
          />
        </div>
      )}

      {activeCoverTab === "description" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Add a short summary for this document. Optional.
          </p>
          <label htmlFor="cover-description" className="sr-only">Document description</label>
          <Textarea
            id="cover-description"
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            placeholder="Write a concise summary of what this document covers..."
            className="min-h-[220px] resize-y"
          />
        </div>
      )}
    </div>
  );
}
