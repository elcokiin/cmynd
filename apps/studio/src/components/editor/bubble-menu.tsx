import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { EditorBubble, EditorBubbleItem, useEditor } from "novel";

import { Button } from "@elcokiin/ui/button";
import { Separator } from "@elcokiin/ui/separator";
import { cn } from "@elcokiin/ui/lib/utils";

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

function TextButtons(): React.ReactNode {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <div className="flex">
      {textFormatItems.map((item) => (
        <EditorBubbleItem key={item.name} onSelect={() => item.command(editor)}>
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

type BubbleMenuProps = {
  className?: string;
};

export function BubbleMenu({ className }: BubbleMenuProps): React.ReactNode {
  return (
    <EditorBubble
      tippyOptions={{
        placement: "top",
      }}
      className={cn(
        "flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-border bg-popover shadow-xl",
        className,
      )}
    >
      <TextButtons />
      <Separator orientation="vertical" className="h-8" />
    </EditorBubble>
  );
}
