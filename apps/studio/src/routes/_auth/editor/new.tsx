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

import { ButtonSubmit } from "@/components/editor/button-submit";
import { ButtonSettings } from "@/components/editor/document-settings";
import { EditableDocumentTitle } from "@/components/editor/editable-document-title";
import { EditorModeToggle } from "@/components/editor/editor-mode-toggle";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { useEditorAutosave } from "@/hooks/use-editor-autosave";
import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useEditorWorkspaceState } from "@/hooks/use-editor-workspace-state";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  downloadMarkdown,
  jsonToMarkdown,
} from "@/lib/markdown-conversion";
import { getRandomTitle, isRandomTitle } from "@/lib/random-titles";

export const Route = createFileRoute("/_auth/editor/new")({
  component: NewDocumentRoute,
});

function NewDocumentRoute() {
  const navigate = useNavigate();
  const { handleError, handleErrorSilent } = useErrorHandler();

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const {
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    setMarkdownFromContent,
    applyMarkdown,
    getExportMarkdown,
  } = useEditorWorkspaceState();

  // Track if document has been created
  const documentIdRef = useRef<Id<"documents"> | null>(null);

  // Refs to hold latest values for callbacks
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const creationPromiseRef = useRef<Promise<void> | null>(null);

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
        isRandomTitle(titleRef.current)
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
  const createNewDocument = useCallback(async (markdownOverride?: string) => {
    if (documentIdRef.current) return;
    if (creationPromiseRef.current) return creationPromiseRef.current;

    creationPromiseRef.current = (async () => {
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

        const isMarkdownMode = editorMode === "markdown";
        const result = await createDocument({
          title: finalTitle,
          type: "own",
          content: contentRef.current,
          markdownSource:
            (markdownOverride ?? markdownDraft) || jsonToMarkdown(contentRef.current),
          contentFormat: isMarkdownMode ? "markdown_imported" : "rich_json",
        } as any);

        documentIdRef.current = result.documentId;
      } catch (error) {
        handleError(error, { context: "Failed to create document" });
      }
    })();

    await creationPromiseRef.current;
    creationPromiseRef.current = null;
  }, [createDocument, editorMode, handleError, markdownDraft]);

  // Save title changes (only if document exists)
  const saveTitleChange = useCallback(async () => {
    // If document doesn't exist yet, create it
    if (!documentIdRef.current) {
      await createNewDocument();
    }
    
    if (!documentIdRef.current) return;

    try {
      await updateTitle({
        documentId: documentIdRef.current,
        title: titleRef.current.trim(),
      });
    } catch (error) {
      handleError(error, { context: "Failed to save title" });
    }
  }, [createNewDocument, updateTitle, handleError]);

  // Save content changes (only if document exists)
  const saveContentChange = useCallback(async (markdownOverride?: string) => {
    // If document doesn't exist yet, create it
    if (!documentIdRef.current) {
      await createNewDocument(markdownOverride);
    }
    
    if (!documentIdRef.current) return;

    try {
      await updateContent({
        documentId: documentIdRef.current,
        content: contentRef.current,
        markdownSource:
          (markdownOverride ?? markdownDraft) || jsonToMarkdown(contentRef.current),
      } as any);
    } catch (error) {
      handleError(error, { context: "Failed to save content" });
    }
  }, [createNewDocument, updateContent, handleError, markdownDraft]);

  const {
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
  } = useEditorAutosave({
    setContent,
    contentRef,
    setMarkdownFromContent,
    applyMarkdown,
    onVisualDebouncedSave: (_, markdown) => saveContentChange(markdown),
    onMarkdownDebouncedSave: (_, markdown) => saveContentChange(markdown),
  });

  const handleExportMarkdown = useCallback(() => {
    const markdown = getExportMarkdown(contentRef.current);
    downloadMarkdown(title || "document", markdown);
  }, [getExportMarkdown, title]);

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
          <div className="flex items-center gap-4 min-w-0">
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
            <EditorModeToggle mode={editorMode} onModeChange={setEditorMode} />
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleExportMarkdown}>
              Export .md
            </Button>
            <ButtonSubmit documentId={documentIdRef.current} title={title} />
            <ButtonSettings documentId={documentIdRef.current} />
          </div>
        </div>
      </div>

      {/* Editor area */}
      <EditorWorkspace
        mode={editorMode}
        content={content}
        markdownValue={markdownDraft}
        onMarkdownChange={setMarkdownDraft}
        onVisualUpdate={handleVisualUpdate}
        onVisualDebouncedUpdate={handleVisualDebouncedUpdate}
        onMarkdownDebouncedUpdate={handleMarkdownDebouncedUpdate}
        editable={true}
        uploadFn={uploadFn}
        onUploadError={handleUploadError}
      />
    </div>
  );
}
