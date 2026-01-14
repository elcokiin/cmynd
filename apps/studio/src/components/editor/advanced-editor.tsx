import type { UploadFn } from "@elcokiin/backend/lib/types/storage";

import { useState } from "react";
import { EditorContent, EditorRoot, type JSONContent } from "novel";
import { useDebouncedCallback } from "use-debounce";

import { editorExtensions } from "@/config/editor-extensions";
import { BubbleMenu } from "./bubble-menu";
import { ImageUploadProvider } from "./image-upload-context";
import { slashCommand, SlashCommand } from "./slash-command";
import { cn } from "@elcokiin/ui/lib/utils";

const extensions = [...editorExtensions, slashCommand];

type AdvancedEditorProps = {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  onDebouncedUpdate?: (content: JSONContent) => void;
  debounceMs?: number;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  uploadFn?: UploadFn | null;
  onUploadError?: (error: Error) => void;
};

export function AdvancedEditor({
  initialContent,
  onUpdate,
  onDebouncedUpdate,
  debounceMs = 1000,
  editable = true,
  className,
  uploadFn = null,
  onUploadError,
}: AdvancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );

  const debouncedUpdate = useDebouncedCallback(async (content: JSONContent) => {
    setSaveStatus("saving");
    onDebouncedUpdate?.(content);
    setSaveStatus("saved");
  }, debounceMs);

  return (
    <ImageUploadProvider uploadFn={uploadFn} onError={onUploadError}>
      <div className={cn("relative w-full", className)}>
        {/* Save status indicator */}
        {onDebouncedUpdate && (
          <div className="absolute top-2 right-2 z-10">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-md",
                saveStatus === "saved" && "text-muted-foreground",
                saveStatus === "saving" &&
                  "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
                saveStatus === "unsaved" &&
                  "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
              )}
            >
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "unsaved" && "Unsaved changes"}
            </span>
          </div>
        )}

        <EditorRoot>
          <EditorContent
            extensions={extensions}
            initialContent={initialContent}
            editable={editable}
            className={cn(
              "prose prose-neutral dark:prose-invert max-w-none",
              "min-h-[500px] p-8",
              "[&_.ProseMirror]:outline-none",
              "[&_.ProseMirror]:min-h-[500px]"
            )}
            onUpdate={({ editor }) => {
              const json = editor.getJSON();
              onUpdate?.(json);

              if (onDebouncedUpdate) {
                setSaveStatus("unsaved");
                debouncedUpdate(json);
              }
            }}
          >
            <SlashCommand />
            <BubbleMenu />
          </EditorContent>
        </EditorRoot>
      </div>
    </ImageUploadProvider>
  );
}

export type { JSONContent };
