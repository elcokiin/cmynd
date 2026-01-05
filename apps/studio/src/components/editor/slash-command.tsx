import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Minus,
} from "lucide-react";
import {
  Command,
  createSuggestionItems,
  renderItems,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorCommand,
} from "novel";
import { uploadImage } from "./image-upload.ts";

// Define suggestion items for the slash command
export const suggestionItems = createSuggestionItems([
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large", "h1"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium", "h2"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small", "h3"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point", "ul"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered", "ol", "numbers"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote", "quotation"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run();
    },
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock", "programming"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <Image size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // Open file picker
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          if (file) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await uploadImage(file, editor as any);
          }
        }
      };
      input.click();
    },
  },
  {
    title: "Divider",
    description: "Add a horizontal divider.",
    searchTerms: ["hr", "horizontal", "rule", "line"],
    icon: <Minus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
]);

// Configure the slash command extension
export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

// Slash command UI component
type SlashCommandProps = {
  className?: string;
};

export function SlashCommand({ className }: SlashCommandProps) {
  return (
    <EditorCommand
      className={
        className ??
        "z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-popover px-1 py-2 shadow-md transition-all"
      }
    >
      <EditorCommandEmpty className="px-2 text-muted-foreground">
        No results
      </EditorCommandEmpty>
      <EditorCommandList>
        {suggestionItems.map((item) => (
          <EditorCommandItem
            key={item.title}
            value={item.title}
            onCommand={(val) => item.command?.(val)}
            className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </EditorCommandItem>
        ))}
      </EditorCommandList>
    </EditorCommand>
  );
}
