import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { Button } from "@elcokiin/ui/button";
import {
  createFileRoute,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { JSONContent } from "novel";

import { AdvancedEditor } from "@/components/editor/advanced-editor";
import { EditableDocumentTitle } from "@/components/editor/editable-document-title";
import { ButtonSubmit } from "@/components/editor/button-submit";
import { ButtonSettings } from "@/components/editor/document-settings-dialog";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { getRandomTitle, isRandomTitle } from "@/lib/random-titles";

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
  const removeDocument = useMutation(api.documents.mutations.remove);
  const uploadFn = useConvexImageUpload();

  // Check if editor has meaningful content (not just empty paragraph)
  const hasContent = useCallback(
    (jsonContent: JSONContent | undefined): boolean => {
      if (!jsonContent) return false;
      if (!jsonContent.content || jsonContent.content.length === 0)
        return false;

      // Check if there's any text content
      const hasText = jsonContent.content.some((node) => {
        if (node.type === "paragraph" && node.content) {
          return node.content.some(
            (child) =>
              child.type === "text" &&
              child.text &&
              child.text.trim().length > 0,
          );
        }
        // Any other node type (heading, list, etc.) counts as content
        return node.type !== "paragraph";
      });

      return hasText;
    },
    [],
  );

  // Handle navigation away from /new route
  // - If document exists but has no content → delete it
  // - Otherwise → allow navigation
  useBlocker({
    shouldBlockFn: async () => {
      // Document was auto-created but user deleted all content → delete the document
      if (
        documentIdRef.current &&
        !hasContent(contentRef.current) &&
        isRandomTitle(title)
      ) {
        try {
          await removeDocument({ documentId: documentIdRef.current });
        } catch (error) {
          handleErrorSilent(error, "NewDocumentRoute.deleteEmptyDocument");
        }
      }

      // Allow navigation
      return false;
    },
    enableBeforeUnload: true,
  });

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
      // Use random title if the user hasn't changed the default "Untitled"
      const currentTitle = titleRef.current.trim();
      const isDefaultTitle = currentTitle === "Untitled" || currentTitle === "";
      const finalTitle = isDefaultTitle ? getRandomTitle() : currentTitle;

      // Update the UI with the random title
      if (isDefaultTitle) {
        setTitle(finalTitle);
        titleRef.current = finalTitle;
      }

      const result = await createDocument({
        title: finalTitle,
        type: "own",
        content: contentRef.current,
      });

      documentIdRef.current = result.documentId;
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

          <div className="flex items-center gap-2">
            <ButtonSubmit documentId={documentIdRef.current} title={title} />
            <ButtonSettings documentId={documentIdRef.current} />
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
