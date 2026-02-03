import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button } from "@elcokiin/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { JSONContent } from "novel";

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

  // Track if document has been created
  const documentIdRef = useRef<Id<"documents"> | null>(null);

  // Refs to hold latest values for callbacks
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const isSavingRef = useRef(false);

  const createDocument = useMutation(api.documents.mutations.create);
  const updateTitle = useMutation(api.documents.mutations.updateTitle);
  const updateContent = useMutation(api.documents.mutations.updateContent);
  const uploadFn = useConvexImageUpload();

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "NewDocumentRoute.handleUploadError");
    },
    [handleErrorSilent],
  );

  // Create the document for the first time
  const createNewDocument = useCallback(async () => {
    if (isSavingRef.current || documentIdRef.current) return;

    isSavingRef.current = true;

    try {
      const result = await createDocument({
        title: titleRef.current.trim(),
        type: "own",
        content: contentRef.current,
      });

      documentIdRef.current = result.documentId;
      
      // Navigate to the editor route with the new document's slug
      navigate({ to: "/editor/$slug", params: { slug: result.slug } });
    } catch (error) {
      handleError(error, { context: "Failed to create document" });
    } finally {
      isSavingRef.current = false;
    }
  }, [createDocument, handleError, navigate]);

  // Save title changes (only if document exists)
  const saveTitleChange = useCallback(async () => {
    if (isSavingRef.current) return;

    // If document doesn't exist yet, create it
    if (!documentIdRef.current) {
      await createNewDocument();
      return;
    }

    isSavingRef.current = true;

    try {
      await updateTitle({
        documentId: documentIdRef.current,
        title: titleRef.current.trim(),
      });
    } catch (error) {
      handleError(error, { context: "Failed to save title" });
    } finally {
      isSavingRef.current = false;
    }
  }, [createNewDocument, updateTitle, handleError]);

  // Save content changes (only if document exists)
  const saveContentChange = useCallback(async () => {
    if (isSavingRef.current) return;

    // If document doesn't exist yet, create it
    if (!documentIdRef.current) {
      await createNewDocument();
      return;
    }

    isSavingRef.current = true;

    try {
      await updateContent({
        documentId: documentIdRef.current,
        content: contentRef.current,
      });
    } catch (error) {
      handleError(error, { context: "Failed to save content" });
    } finally {
      isSavingRef.current = false;
    }
  }, [createNewDocument, updateContent, handleError]);

  // Handle content updates
  const handleContentUpdate = useCallback((newContent: JSONContent) => {
    setContent(newContent);
    contentRef.current = newContent;
  }, []);

  // Trigger save when content stops changing (debounced by AdvancedEditor)
  const handleContentDebounced = useCallback(
    (newContent: JSONContent) => {
      contentRef.current = newContent;
      saveContentChange();
    },
    [saveContentChange],
  );

  // Handle title updates with debounce
  const debouncedSaveTitle = useDebouncedCallback(() => {
    saveTitleChange();
  }, 1000);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      titleRef.current = newTitle;
      debouncedSaveTitle();
    },
    [debouncedSaveTitle],
  );

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
