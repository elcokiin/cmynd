import type { JSONContent } from "novel";

import { useCallback, useState } from "react";

import {
  getMarkdownForExport,
  jsonToMarkdown,
  markdownToJson,
} from "@/lib/markdown-conversion";

export function useEditorWorkspaceState() {
  const [editorMode, setEditorMode] = useState<"visual" | "markdown">("visual");
  const [markdownDraft, setMarkdownDraft] = useState("");

  const setMarkdownFromContent = useCallback((content?: JSONContent): string => {
    const nextMarkdown = jsonToMarkdown(content);
    setMarkdownDraft((previous) =>
      previous === nextMarkdown ? previous : nextMarkdown,
    );
    return nextMarkdown;
  }, []);

  const applyMarkdown = useCallback((markdown: string): JSONContent => {
    setMarkdownDraft(markdown);
    return markdownToJson(markdown);
  }, []);

  const getExportMarkdown = useCallback(
    (content?: JSONContent): string => {
      return getMarkdownForExport({
        editorMode,
        markdownDraft,
        content,
      });
    },
    [editorMode, markdownDraft],
  );

  return {
    editorMode,
    setEditorMode,
    markdownDraft,
    setMarkdownDraft,
    setMarkdownFromContent,
    applyMarkdown,
    getExportMarkdown,
  };
}
