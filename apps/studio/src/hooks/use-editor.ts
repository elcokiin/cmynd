import type { JSONContent } from "novel";
import { useCallback, useRef, useState } from "react";

import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useEditorAutosave } from "@/hooks/use-editor-autosave";
import { useEditorWorkspaceState } from "@/hooks/use-editor-workspace-state";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { downloadMarkdown } from "@/lib/markdown-conversion";

type UseEditorOptions = {
  onSave?: (content: JSONContent, markdown: string) => void | Promise<void>;
};

export function useEditor(options?: UseEditorOptions) {
  const { handleErrorSilent } = useErrorHandler();
  const [content, setContent] = useState<JSONContent | undefined>(undefined);
  const contentRef = useRef<JSONContent | undefined>(undefined);
  const uploadFn = useConvexImageUpload();

  const {
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    setMarkdownFromContent,
    applyMarkdown,
    getExportMarkdown,
  } = useEditorWorkspaceState();

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "Editor.handleUploadError");
    },
    [handleErrorSilent],
  );

  const {
    syncContent,
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
  } = useEditorAutosave({
    setContent,
    contentRef,
    setMarkdownFromContent,
    applyMarkdown,
    onVisualDebouncedSave: options?.onSave,
    onMarkdownDebouncedSave: options?.onSave,
  });

  const handleExportMarkdown = useCallback(
    (filename?: string) => {
      const markdown = getExportMarkdown(contentRef.current);
      downloadMarkdown(filename || "document", markdown);
    },
    [getExportMarkdown],
  );

  return {
    content,
    setContent,
    contentRef,
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    setMarkdownFromContent,
    applyMarkdown,
    getExportMarkdown,
    syncContent,
    handleVisualUpdate,
    handleVisualDebouncedUpdate,
    handleMarkdownDebouncedUpdate,
    uploadFn,
    handleUploadError,
    handleExportMarkdown,
  };
}
