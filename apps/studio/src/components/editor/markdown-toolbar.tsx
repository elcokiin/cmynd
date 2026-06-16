import { Button } from "@elcokiin/ui/button";
import { Separator } from "@elcokiin/ui/separator";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
} from "lucide-react";

type MarkdownToolbarProps = {
  onInsertWrapping: (before: string, after: string) => void;
  onInsertLinePrefix: (prefix: string) => void;
};

type ToolbarGroup = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (props: MarkdownToolbarProps) => void;
};

const groups: ToolbarGroup[][] = [
  [
    {
      id: "bold",
      label: "Bold",
      icon: BoldIcon,
      action: (props) => props.onInsertWrapping("**", "**"),
    },
    {
      id: "italic",
      label: "Italic",
      icon: ItalicIcon,
      action: (props) => props.onInsertWrapping("*", "*"),
    },
    {
      id: "link",
      label: "Link",
      icon: LinkIcon,
      action: (props) => props.onInsertWrapping("[", "](url)"),
    },
    {
      id: "image",
      label: "Image",
      icon: ImageIcon,
      action: (props) => props.onInsertWrapping("![", "](url)"),
    },
  ],
  [
    {
      id: "h1",
      label: "Heading 1",
      icon: Heading1Icon,
      action: (props) => props.onInsertLinePrefix("# "),
    },
    {
      id: "h2",
      label: "Heading 2",
      icon: Heading2Icon,
      action: (props) => props.onInsertLinePrefix("## "),
    },
    {
      id: "h3",
      label: "Heading 3",
      icon: Heading3Icon,
      action: (props) => props.onInsertLinePrefix("### "),
    },
  ],
  [
    {
      id: "ul",
      label: "Bullet List",
      icon: ListIcon,
      action: (props) => props.onInsertLinePrefix("- "),
    },
    {
      id: "ol",
      label: "Ordered List",
      icon: ListOrderedIcon,
      action: (props) => props.onInsertLinePrefix("1. "),
    },
    {
      id: "code",
      label: "Code Block",
      icon: CodeIcon,
      action: (props) => props.onInsertWrapping("```\n", "\n```"),
    },
    {
      id: "quote",
      label: "Blockquote",
      icon: QuoteIcon,
      action: (props) => props.onInsertLinePrefix("> "),
    },
    {
      id: "hr",
      label: "Horizontal Rule",
      icon: MinusIcon,
      action: (props) => props.onInsertLinePrefix("---\n"),
    },
  ],
];

export function MarkdownToolbar(props: MarkdownToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border rounded-t-md bg-muted/30 overflow-x-auto">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center gap-0.5">
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-5" />
          )}
          {group.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => item.action(props)}
              title={item.label}
              className="h-8 w-8 p-0"
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
