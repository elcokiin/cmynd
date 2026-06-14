import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import { useBlocker } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { JSONContent } from "novel";

import { useEditor } from "@/hooks/use-editor";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { jsonToMarkdown } from "@/lib/markdown-conversion";
import { getRandomTitle, isRandomTitle } from "@/lib/random-titles";

export function useNewDocument() {
  const { handleError, handleErrorSilent } = useErrorHandler();

  const [title, setTitle] = useState("Untitled");
  const titleRef = useRef(title);
  const documentIdRef = useRef<Id<"documents"> | null>(null);
  const creationPromiseRef = useRef<Promise<void> | null>(null);

  const createDocument = useMutation(api.documents.mutations.create);
  const updateTitle = useMutation(api.documents.mutations.updateTitle);
  const updateContent = useMutation(api.documents.mutations.updateContent);
  const removeDocument = useMutation(api.documents.mutations.remove);

  const onSaveRef = useRef<((content: JSONContent, markdown: string) => void | Promise<void>) | null>(null);

  const editor = useEditor({
    onSave: useCallback(
      (content: JSONContent, markdown: string) => onSaveRef.current?.(content, markdown),
      [],
    ),
  });

  const hasContent = useCallback(
    (jsonContent: JSONContent | undefined): boolean => {
      if (!jsonContent) return false;
      if (!jsonContent.content || jsonContent.content.length === 0) return false;

      const hasText = jsonContent.content.some((node) => {
        if (node.type === "paragraph" && node.content) {
          return node.content.some(
            (child) =>
              child.type === "text" &&
              child.text &&
              child.text.trim().length > 0,
          );
        }
        return node.type !== "paragraph";
      });

      return hasText;
    },
    [],
  );

  useBlocker({
    shouldBlockFn: async () => {
      if (
        documentIdRef.current &&
        !hasContent(editor.contentRef.current) &&
        isRandomTitle(titleRef.current)
      ) {
        try {
          await removeDocument({ documentId: documentIdRef.current });
        } catch (error) {
          handleErrorSilent(error, "NewDocumentRoute.deleteEmptyDocument");
        }
      }

      return false;
    },
    enableBeforeUnload: true,
  });

  const createNewDocument = useCallback(async (markdownOverride?: string) => {
    if (documentIdRef.current) return;
    if (creationPromiseRef.current) return creationPromiseRef.current;

    creationPromiseRef.current = (async () => {
      try {
        const currentTitle = titleRef.current.trim();
        const isDefaultTitle = currentTitle === "Untitled" || currentTitle === "";
        const finalTitle = isDefaultTitle ? getRandomTitle() : currentTitle;

        if (isDefaultTitle) {
          setTitle(finalTitle);
          titleRef.current = finalTitle;
        }

        const isMarkdownMode = editor.editorMode === "markdown";
        const result = await createDocument({
          title: finalTitle,
          type: "own",
          content: editor.contentRef.current,
          markdownSource:
            (markdownOverride ?? editor.markdownDraft) || jsonToMarkdown(editor.contentRef.current),
          contentFormat: isMarkdownMode ? "markdown_imported" : "rich_json",
        } as any);

        documentIdRef.current = result.documentId;
      } catch (error) {
        handleError(error, { context: "Failed to create document" });
      }
    })();

    await creationPromiseRef.current;
    creationPromiseRef.current = null;
  }, [createDocument, editor.editorMode, handleError, editor.markdownDraft]);

  const saveTitleChange = useCallback(async () => {
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

  const saveContentChange = useCallback(
    async (markdownOverride?: string) => {
      if (!documentIdRef.current) {
        await createNewDocument(markdownOverride);
      }

      if (!documentIdRef.current) return;

      try {
        await updateContent({
          documentId: documentIdRef.current,
          content: editor.contentRef.current,
          markdownSource:
            (markdownOverride ?? editor.markdownDraft) || jsonToMarkdown(editor.contentRef.current),
        } as any);
      } catch (error) {
        handleError(error, { context: "Failed to save content" });
      }
    },
    [createNewDocument, updateContent, handleError, editor.markdownDraft],
  );

  onSaveRef.current = (_, markdown) => saveContentChange(markdown);

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

  return {
    title,
    handleTitleChange,
    documentIdRef,
    content: editor.content,
    editorMode: editor.editorMode,
    setEditorMode: editor.setEditorMode,
    markdownDraft: editor.markdownDraft,
    setMarkdownDraft: editor.setMarkdownDraft,
    handleVisualUpdate: editor.handleVisualUpdate,
    handleVisualDebouncedUpdate: editor.handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate: editor.handleMarkdownDebouncedUpdate,
    uploadFn: editor.uploadFn,
    handleUploadError: editor.handleUploadError,
    handleExportMarkdown: editor.handleExportMarkdown,
  };
}
