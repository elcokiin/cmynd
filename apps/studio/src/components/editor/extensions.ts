import {
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  TextStyle,
  Color,
  HighlightExtension,
} from "novel";
import { cx } from "class-variance-authority";

const placeholder = Placeholder.configure({
  placeholder: "Press '/' for commands, or start typing...",
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-primary underline underline-offset-[3px] hover:text-primary/80 transition-colors cursor-pointer",
    ),
  },
});

const tiptapImage = TiptapImage.configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-border"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

// Horizontal rule configuration
const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

// StarterKit configuration (includes most basic extensions)
const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted px-1.5 py-1 font-mono font-medium"),
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

export const defaultExtensions = [
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
