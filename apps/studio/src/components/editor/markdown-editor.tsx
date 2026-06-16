import { cn } from "@elcokiin/ui/lib/utils";
import { useEffect, useMemo, useRef, useState, useCallback, type KeyboardEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { marked } from "marked";
import { Button } from "@elcokiin/ui/button";
import { EyeIcon, FileCode2Icon, LayoutPanelLeftIcon } from "lucide-react";

import { MarkdownToolbar } from "./markdown-toolbar";

type ViewMode = "edit" | "preview" | "split";

type MarkdownEditorProps = {
  initialValue?: string;
  onChange?: (value: string) => void;
  onDebouncedUpdate?: (value: string) => void | Promise<void>;
  debounceMs?: number;
  editable?: boolean;
  className?: string;
};

const viewModeOptions: { value: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "edit", label: "Edit", icon: FileCode2Icon },
  { value: "preview", label: "Preview", icon: EyeIcon },
  { value: "split", label: "Split", icon: LayoutPanelLeftIcon },
];

export function MarkdownEditor({
  initialValue = "",
  onChange,
  onDebouncedUpdate,
  debounceMs = 1000,
  editable = true,
  className,
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

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

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChange?.(newValue);

      if (onDebouncedUpdate) {
        setSaveStatus("unsaved");
        debouncedUpdate(newValue);
      }
    },
    [onChange, onDebouncedUpdate, debouncedUpdate],
  );

  const insertWrapping = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);

      handleChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(
            start + before.length,
            start + before.length + selectedText.length,
          );
        } else {
          textarea.setSelectionRange(start + before.length, start + before.length);
        }
      });
    },
    [value, handleChange],
  );

  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);

      handleChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      });
    },
    [value, handleChange],
  );

  const lineCount = value.split("\n").length;
  const lineNumbers = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  const handleScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const previewHtml = useMemo(() => {
    if (!value.trim()) {
      return "";
    }
    try {
      return marked.parse(value, { async: false, gfm: true, breaks: true }) as string;
    } catch {
      return '<p class="text-red-500">Failed to render preview</p>';
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);

        handleChange(newValue);

        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, start + 2);
        });
      }
    },
    [value, handleChange],
  );

  const showSource = viewMode === "edit" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split";

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {onDebouncedUpdate && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-md",
              saveStatus === "saved" && "text-muted-foreground",
              saveStatus === "saving" && "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
              saveStatus === "unsaved" && "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
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

      {editable && (
        <div className="flex items-center justify-between border rounded-t-md bg-muted/30">
          <div className="flex-1 min-w-0">
            <MarkdownToolbar
              onInsertWrapping={insertWrapping}
              onInsertLinePrefix={insertLinePrefix}
            />
          </div>
          <div className="flex items-center gap-0.5 pr-2">
            {viewModeOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={viewMode === option.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode(option.value)}
                title={option.label}
                className="h-7 px-2 text-xs"
              >
                <option.icon className="h-3.5 w-3.5 mr-1" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 overflow-hidden",
          "border-l border-r border-b rounded-b-md",
          !editable && "border-t rounded-t-md",
        )}
      >
        {showSource && (
          <>
            <div
              ref={gutterRef}
              className="select-none text-right py-4 font-mono text-sm leading-6 text-muted-foreground/30 border-r bg-muted/20 overflow-hidden"
              style={{ minWidth: "2.5rem", width: "2.5rem" }}
              aria-hidden="true"
            >
              {lineNumbers.map((num) => (
                <div key={num} className="px-1.5">
                  {num}
                </div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              readOnly={!editable}
              className={cn(
                "flex-1 min-h-[500px] bg-background py-4 pl-4 pr-4 font-mono text-sm leading-6",
                "outline-none border-none focus:ring-0",
                editable && "resize-y",
                !editable && "opacity-90 cursor-default resize-none",
              )}
              placeholder="Write markdown here..."
              spellCheck={false}
            />
          </>
        )}

        {viewMode === "split" && showSource && showPreview && (
          <div className="w-px bg-border shrink-0" />
        )}

        {showPreview && (
          <div
            className={cn(
              "flex-1 min-h-[500px] overflow-auto",
              "prose prose-neutral dark:prose-invert prose-sm max-w-none",
              "bg-background p-6",
              !showSource && "rounded-b-md",
            )}
          >
            {previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
