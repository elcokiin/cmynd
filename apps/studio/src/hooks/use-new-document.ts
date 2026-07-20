import { api } from "@elcokiin/backend/convex/_generated/api";
import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";
import type { SerializedEditorState } from "lexical";
import { useBlocker } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { useErrorHandler } from "@/hooks/use-error-handler";
import { getRandomTitle, isRandomTitle } from "@/lib/random-titles";
import { extractImageKeys } from "@/utils/extract-image-keys";

export function useNewDocument() {
  const { handleError, handleErrorSilent } = useErrorHandler();

  const [title, setTitle] = useState("Untitled");
  const [documentId, setDocumentId] = useState<Id<"documents"> | null>(null);
  const titleRef = useRef(title);
  const contentRef = useRef<SerializedEditorState | undefined>(undefined);
  const documentIdRef = useRef<Id<"documents"> | null>(null);
  const creationPromiseRef = useRef<Promise<void> | null>(null);

  const createDocument = useMutation(api.documents.mutations.create);
  const updateTitle = useMutation(api.documents.mutations.updateTitle);
  const updateContent = useMutation(api.documents.mutations.updateContent);
  const removeDocument = useMutation(api.documents.mutations.remove);

  const hasContent = useCallback(
    (content: SerializedEditorState | undefined): boolean => {
      if (!content) return false;
      const root = content.root;
      if (!root?.children || root.children.length === 0) return false;
      return root.children.some((node: any) => {
        if (node.type === "paragraph" && node.children) {
          return node.children.some(
            (child: any) =>
              child.type === "text" &&
              child.text &&
              child.text.trim().length > 0,
          );
        }
        return node.type !== "paragraph";
      });
    },
    [],
  );

  useBlocker({
    shouldBlockFn: async () => {
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
      return false;
    },
    enableBeforeUnload: true,
  });

  const createNewDocument = useCallback(async () => {
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

        const result = await createDocument({
          title: finalTitle,
          type: "own",
          content: contentRef.current,
        });

        documentIdRef.current = result.documentId;
        setDocumentId(result.documentId);
      } catch (error) {
        handleError(error, { context: "Failed to create document" });
      }
    })();

    await creationPromiseRef.current;
    creationPromiseRef.current = null;
  }, [createDocument, handleError]);

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

  const saveContentChange = useCallback(async () => {
    if (!documentIdRef.current) {
      await createNewDocument();
    }
    if (!documentIdRef.current) return;

    try {
      const content = contentRef.current!;
      const imageStorageIds = extractImageKeys(content);
      await updateContent({
        documentId: documentIdRef.current,
        content,
        imageStorageIds,
      });
    } catch (error) {
      handleError(error, { context: "Failed to save content" });
    }
  }, [createNewDocument, updateContent, handleError]);

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

  const handleContentChange = useCallback(
    (content: SerializedEditorState) => {
      contentRef.current = content;
    },
    [],
  );

  return {
    title,
    handleTitleChange,
    documentId,
    handleContentChange,
    saveContentChange,
  };
}
