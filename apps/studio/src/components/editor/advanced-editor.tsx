import type { SerializedEditorState } from "lexical";

import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Editor, type UploadFn } from "@elcokiin/ui/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@elcokiin/ui/tooltip";
import { cn } from "@elcokiin/ui/lib/utils";

export type AdvancedEditorProps = {
  initialContent?: SerializedEditorState;
  onChange?: (state: SerializedEditorState) => void;
  onSave?: (state: SerializedEditorState) => Promise<void>;
  debounceMs?: number;
  editable?: boolean;
  variant?: "minimal" | "medium" | "full";
  className?: string;
  uploadFn?: UploadFn | null;
  onUploadError?: (error: Error) => void;
};

export function AdvancedEditor({
  initialContent,
  onChange,
  onSave,
  debounceMs = 1000,
  editable = true,
  variant = "full",
  className,
  uploadFn = null,
  onUploadError: _onUploadError,
}: AdvancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">(
    "saved",
  );

  const lastSavedContent = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  const debouncedSave = useDebouncedCallback(async (state: SerializedEditorState) => {
    setSaveStatus("saving");
    try {
      await onSave?.(state);
      lastSavedContent.current = JSON.stringify(state);
      setSaveStatus("saved");
    } catch (error) {
      console.error("[AdvancedEditor] Failed to save:", error);
      setSaveStatus("error");
    }
  }, debounceMs);

  const handleChange = useCallback(
    (state: SerializedEditorState) => {
      onChange?.(state);
      if (!onSave) return;

      const serialized = JSON.stringify(state);

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        lastSavedContent.current = serialized;
        return;
      }

      if (serialized !== lastSavedContent.current) {
        setSaveStatus("unsaved");
        debouncedSave(state);
      }
    },
    [onChange, onSave, debouncedSave],
  );

  return (
    <div className={cn("relative w-full", className)}>
      {onSave && (
        <div className="absolute top-2 right-2 z-10">
          <Tooltip>
            <TooltipTrigger>
              <span
                className={cn(
                  "inline-block size-2.5 rounded-full transition-colors",
                  saveStatus === "saved" && "bg-green-500",
                  saveStatus === "saving" && "bg-yellow-500",
                  saveStatus === "unsaved" && "bg-orange-500",
                  saveStatus === "error" && "bg-red-500",
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved changes"}
              {saveStatus === "error" && "Error saving"}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <Editor
        initialContent={initialContent}
        onChange={handleChange}
        editable={editable}
        variant={variant}
        uploadFn={uploadFn}
      />
    </div>
  );
}
