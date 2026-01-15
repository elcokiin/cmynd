import {
  Color,
  HighlightExtension,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  UpdatedImage,
} from "novel";
import { cn } from "@elcokiin/ui/lib/utils";

const placeholder = Placeholder.configure({
  placeholder: "Press '/' for commands, or start typing...",
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cn(
      "text-primary underline underline-offset-[3px] hover:text-primary/80 transition-colors cursor-pointer"
    ),
  },
});

const tiptapImage = TiptapImage.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cn("rounded-lg border border-border"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cn("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cn("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cn("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cn("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cn("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cn("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cn("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cn("rounded-md bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cn("rounded-md bg-muted px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const textStyle = TextStyle.configure({});

const color = Color.configure({
  types: ["textStyle"],
});

const highlight = HighlightExtension.configure({
  multicolor: true,
});

const underline = TiptapUnderline.configure({});

export const editorExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule,
  textStyle,
  color,
  highlight,
  underline,
];
