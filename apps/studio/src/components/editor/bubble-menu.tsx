import { EditorBubble, EditorBubbleItem, useEditor } from "novel";

import { Separator } from "@elcokiin/ui/separator";
import { cn } from "@elcokiin/ui/lib/utils";
import { EditorFormatToolbar } from "./editor-format-toolbar";
import { editorFormatActions } from "./editor-format-actions";

function TextButtons(): React.ReactNode {
  const { editor } = useEditor();

  if (!editor) return null;

  return (
    <EditorFormatToolbar
      editor={editor}
      overflow={false}
      actions={editorFormatActions}
      actionWrapper={(action, button) => (
        <EditorBubbleItem key={action.id} onSelect={() => action.run(editor)}>
          {button}
        </EditorBubbleItem>
      )}
    />
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
