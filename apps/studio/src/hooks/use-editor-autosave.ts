import type { JSONContent } from "novel";

import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { useCallback } from "react";

type UseEditorAutosaveOptions = {
  setContent: Dispatch<SetStateAction<JSONContent | undefined>>;
  contentRef: MutableRefObject<JSONContent | undefined>;
  setMarkdownFromContent: (content?: JSONContent) => string;
  applyMarkdown: (markdown: string) => JSONContent;
  onVisualDebouncedSave?: (
    content: JSONContent,
    markdown: string,
  ) => void | Promise<void>;
  onMarkdownDebouncedSave?: (
    content: JSONContent,
    markdown: string,
  ) => void | Promise<void>;
};

export function useEditorAutosave({
  setContent,
  contentRef,
  setMarkdownFromContent,
  applyMarkdown,
  onVisualDebouncedSave,
  onMarkdownDebouncedSave,
}: UseEditorAutosaveOptions) {
  const syncContent = useCallback(
    (nextContent?: JSONContent) => {
      setContent(nextContent);
      contentRef.current = nextContent;
      setMarkdownFromContent(nextContent);
    },
    [setMarkdownFromContent],
  );

  const handleVisualUpdate = useCallback(
    (nextContent: JSONContent) => {
      setContent(nextContent);
      contentRef.current = nextContent;
      setMarkdownFromContent(nextContent);
    },
    [setMarkdownFromContent],
  );

  const handleVisualDebouncedUpdate = useCallback(
    async (nextContent: JSONContent) => {
      setContent(nextContent);
      contentRef.current = nextContent;
      const markdown = setMarkdownFromContent(nextContent);
      await onVisualDebouncedSave?.(nextContent, markdown);
    },
    [onVisualDebouncedSave, setMarkdownFromContent],
  );

  const handleMarkdownDebouncedUpdate = useCallback(
    async (markdown: string) => {
      const nextContent = applyMarkdown(markdown);
      setContent(nextContent);
      contentRef.current = nextContent;
      await onMarkdownDebouncedSave?.(nextContent, markdown);
    },
    [applyMarkdown, onMarkdownDebouncedSave],
  );

  return {
    syncContent,
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
  };
}
