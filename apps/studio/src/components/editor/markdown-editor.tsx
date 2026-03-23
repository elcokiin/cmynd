import { cn } from "@elcokiin/ui/lib/utils";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type MarkdownEditorProps = {
  initialValue?: string;
  onChange?: (value: string) => void;
  onDebouncedUpdate?: (value: string) => void | Promise<void>;
  debounceMs?: number;
  editable?: boolean;
  className?: string;
};

export function MarkdownEditor({
  initialValue = "",
  onChange,
  onDebouncedUpdate,
  debounceMs = 1000,
  editable = true,
  className,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">(
    "saved",
  );

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedUpdate = useDebouncedCallback(async (nextValue: string) => {
    setSaveStatus("saving");
    try {
      await onDebouncedUpdate?.(nextValue);
      setSaveStatus("saved");
    } catch (error) {
      console.error("[MarkdownEditor] Failed to save:", error);
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
              saveStatus === "error" && "text-red-600 bg-red-50 dark:bg-red-900/20",
            )}
          >
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "unsaved" && "Unsaved changes"}
            {saveStatus === "error" && "Error saving"}
          </span>
        </div>
      )}

      <textarea
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onChange?.(nextValue);

          if (onDebouncedUpdate) {
            setSaveStatus("unsaved");
            debouncedUpdate(nextValue);
          }
        }}
        readOnly={!editable}
        className={cn(
          "w-full min-h-[500px] resize-y rounded-md border bg-background p-6",
          "font-mono text-sm leading-6 outline-none",
          "focus:ring-2 focus:ring-ring focus:border-transparent",
          !editable && "opacity-90 cursor-default",
        )}
        placeholder="Write markdown here..."
      />
    </div>
  );
}
