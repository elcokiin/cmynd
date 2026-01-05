import { useState } from "react";
import {
  EditorRoot,
  EditorContent,
  EditorBubble,
  EditorBubbleItem,
  type JSONContent,
  useEditor,
} from "novel";
import { useDebouncedCallback } from "use-debounce";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";

import { defaultExtensions } from "./extensions";
import { slashCommand, SlashCommand } from "./slash-command";
import { cn } from "@elcokiin/ui/lib/utils";
import { Button } from "@elcokiin/ui/button";
import { Separator } from "@elcokiin/ui/separator";

// Combine default extensions with slash command
const extensions = [...defaultExtensions, slashCommand];

// Text formatting items for the bubble menu
const textFormatItems = [
  {
    name: "bold",
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.isActive("bold") ?? false,
    command: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.chain().focus().toggleBold().run(),
    icon: BoldIcon,
  },
  {
    name: "italic",
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.isActive("italic") ?? false,
    command: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.chain().focus().toggleItalic().run(),
    icon: ItalicIcon,
  },
  {
    name: "underline",
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.isActive("underline") ?? false,
    command: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.chain().focus().toggleUnderline().run(),
    icon: UnderlineIcon,
  },
  {
    name: "strike",
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.isActive("strike") ?? false,
    command: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.chain().focus().toggleStrike().run(),
    icon: StrikethroughIcon,
  },
  {
    name: "code",
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.isActive("code") ?? false,
    command: (editor: ReturnType<typeof useEditor>["editor"]) =>
      editor?.chain().focus().toggleCode().run(),
    icon: CodeIcon,
  },
];

// Bubble menu text buttons component
function TextButtons() {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <div className="flex">
      {textFormatItems.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={() => item.command(editor)}
        >
          <Button size="icon" variant="ghost" className="rounded-none h-8 w-8">
            <item.icon
              className={cn("h-4 w-4", {
                "text-primary": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
}

// Props for the advanced editor
type AdvancedEditorProps = {
  initialContent?: JSONContent;
  onUpdate?: (content: JSONContent) => void;
  onDebouncedUpdate?: (content: JSONContent) => void;
  debounceMs?: number;
  editable?: boolean;
  className?: string;
  placeholder?: string;
};

export function AdvancedEditor({
  initialContent,
  onUpdate,
  onDebouncedUpdate,
  debounceMs = 1000,
  editable = true,
  className,
}: AdvancedEditorProps) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );

  // Debounced update handler
  const debouncedUpdate = useDebouncedCallback(
    async (content: JSONContent) => {
      setSaveStatus("saving");
      await onDebouncedUpdate?.(content);
      setSaveStatus("saved");
    },
    debounceMs
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* Save status indicator */}
      {onDebouncedUpdate && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-md",
              saveStatus === "saved" && "text-muted-foreground",
              saveStatus === "saving" && "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
              saveStatus === "unsaved" && "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
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
          {/* Slash command menu */}
          <SlashCommand />

          {/* Bubble menu for text selection */}
          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover shadow-xl"
          >
            <TextButtons />
            <Separator orientation="vertical" className="h-8" />
            {/* Could add more selectors here: NodeSelector, LinkSelector, ColorSelector */}
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}

export type { JSONContent };
