import { useCallback, useRef } from "react";
import type { LexicalEditor } from "lexical";
import type { SerializedEditorState } from "lexical";

import { useConvexImageUpload } from "@/hooks/use-convex-image-upload";
import { useErrorHandler } from "@/hooks/use-error-handler";

export function useEditor() {
  const { handleErrorSilent } = useErrorHandler();
  const editorRef = useRef<LexicalEditor | null>(null);
  const contentRef = useRef<SerializedEditorState | undefined>(undefined);
  const uploadFn = useConvexImageUpload();

  const handleUploadError = useCallback(
    (error: Error) => {
      handleErrorSilent(error, "Editor.handleUploadError");
    },
    [handleErrorSilent],
  );

  return {
    editorRef,
    contentRef,
    uploadFn,
    handleUploadError,
  };
}
