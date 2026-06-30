import type { SerializedEditorState } from "lexical";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Editor, type UploadFn } from "@elcokiin/ui/editor";
import { cn } from "@elcokiin/ui/lib/utils";

export type AdvancedEditorProps = {
  initialContent?: SerializedEditorState;
  onChange?: (state: SerializedEditorState) => void;
  onDebouncedUpdate?: (state: SerializedEditorState) => void;
  debounceMs?: number;
  editable?: boolean;
  className?: string;
  uploadFn?: UploadFn | null;
  onUploadError?: (error: Error) => void;
};

export function AdvancedEditor({
  initialContent,
  onChange,
  onDebouncedUpdate,
  debounceMs = 1000,
  editable = true,
  className,
  uploadFn = null,
  onUploadError,
}: AdvancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">(
    "saved",
  );

  const debouncedUpdate = useDebouncedCallback(async (state: SerializedEditorState) => {
    setSaveStatus("saving");
    try {
      await onDebouncedUpdate?.(state);
      setSaveStatus("saved");
    } catch (error) {
      console.error("[AdvancedEditor] Failed to save:", error);
      setSaveStatus("error");
    }
  }, debounceMs);

  return (
    <div className={cn("relative w-full", className)}>
      {onDebouncedUpdate && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-md",
              saveStatus === "saved" && "text-muted-foreground",
              saveStatus === "saving" &&
                "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
              saveStatus === "unsaved" &&
                "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
              saveStatus === "error" &&
                "text-red-600 bg-red-50 dark:bg-red-900/20",
            )}
          >
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "unsaved" && "Unsaved changes"}
            {saveStatus === "error" && "Error saving"}
          </span>
        </div>
      )}

      <Editor
        initialContent={initialContent}
        onChange={onChange}
        onDebouncedUpdate={onDebouncedUpdate ? debouncedUpdate : undefined}
        editable={editable}
        uploadFn={uploadFn}
      />
    </div>
  );
}
