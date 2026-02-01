import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { EditableDocumentTitle } from "@/components/editor/editable-document-title";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";
import type { JSONContent } from "novel";

export const Route = createFileRoute("/_auth/editor/new")({
  component: NewDocumentRoute,
});

function NewDocumentRoute() {
  const navigate = useNavigate();
  const { handleError, handleErrorSilent } = useErrorHandler();

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  // Refs to hold latest values for callbacks
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const isSavingRef = useRef(isSaving);

  const createDocument = useMutation(api.documents.mutations.create);
  const uploadFn = useConvexImageUpload();

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "NewDocumentRoute.handleUploadError");
    },
    [handleErrorSilent],
  );

  const saveDocument = useCallback(async () => {
    if (isSavingRef.current) return;

    setIsSaving(true);
    isSavingRef.current = true;

    try {
      const result = await createDocument({
        title: titleRef.current.trim(),
        type: "own",
        content: contentRef.current,
      });

      toast.success("Document created successfully");

      navigate({
        to: "/editor/$slug",
        params: { slug: result.slug },
      });
    } catch (error) {
      handleError(error, { context: "Failed to create document" });
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [createDocument, navigate, handleError]);

  // Handle content updates
  const handleContentUpdate = useCallback((newContent: JSONContent) => {
    setContent(newContent);
    contentRef.current = newContent;
  }, []);

  // Trigger save when content stops changing (debounced by AdvancedEditor)
  const handleContentDebounced = useCallback((newContent: JSONContent) => {
    // Ensure ref is up to date (should be already via handleContentUpdate, but for safety)
    contentRef.current = newContent;
    saveDocument();
  }, [saveDocument]);

  // Handle title updates
  const debouncedSaveTitle = useDebouncedCallback(() => {
    saveDocument();
  }, 1000);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    titleRef.current = newTitle;
    debouncedSaveTitle();
  }, [debouncedSaveTitle]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/" })}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>

            <EditableDocumentTitle
              title={title}
              onTitleChange={handleTitleChange}
              isEditable={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {isSaving ? "Saving..." : "Draft"}
            </div>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-clip">
        <div className="max-w-4xl mx-auto">
          <AdvancedEditor
            initialContent={content}
            onUpdate={handleContentUpdate}
            onDebouncedUpdate={handleContentDebounced}
            editable={true}
            uploadFn={uploadFn}
            onUploadError={handleUploadError}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
}
