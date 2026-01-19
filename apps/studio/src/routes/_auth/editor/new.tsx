import type { JSONContent } from "novel";

import { api } from "@elcokiin/backend/convex/_generated/api";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { EditableDocumentTitle } from "@/components/editor/editable-document-title";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";

export const Route = createFileRoute("/_auth/editor/new")({
  component: NewDocumentRoute,
});

function NewDocumentRoute() {
  const navigate = useNavigate();
  const { handleError, handleErrorSilent } = useErrorHandler();

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const createDocument = useMutation(api.documents.mutations.create);
  const uploadFn = useConvexImageUpload();

  const handleContentChange = useCallback((newContent: JSONContent) => {
    setContent(newContent);
  }, []);

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "NewDocumentRoute.handleUploadError");
    },
    [handleErrorSilent],
  );

  const handleSave = useCallback(async () => {
    // Validate title
    const trimmedTitle = title.trim().toLowerCase();
    if (trimmedTitle === "" || trimmedTitle === "untitled") {
      toast.error("Please provide a valid title for your document");
      return;
    }

    // Check if there's any content
    if (!content) {
      toast.error("Please add some content to your document");
      return;
    }

    setIsSaving(true);

    try {
      const result = await createDocument({
        title: title.trim(),
        type: "own",
        content,
      });

      toast.success("Document created successfully");

      // Navigate to the editor with the new slug
      navigate({
        to: "/editor/$slug",
        params: { slug: result.slug },
      });
    } catch (error) {
      handleError(error, { context: "Failed to create document" });
    } finally {
      setIsSaving(false);
    }
  }, [title, content, createDocument, navigate, handleError]);

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
              onTitleChange={setTitle}
              isEditable={true}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Draft - Not saved
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Document"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <AdvancedEditor
            initialContent={content}
            onDebouncedUpdate={handleContentChange}
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
