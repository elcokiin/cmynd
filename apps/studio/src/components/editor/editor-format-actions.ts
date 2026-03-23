import type { EditorInstance } from "novel";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

type EditorLike = EditorInstance | null;

export type EditorFormatAction = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (editor: EditorLike) => boolean;
  run: (editor: EditorLike) => void;
};

const toggleMark =
  (mark: "bold" | "italic" | "underline" | "strike" | "code") =>
  (editor: EditorLike) => {
    if (!editor) return;

    if (mark === "bold") editor.chain().focus().toggleBold().run();
    if (mark === "italic") editor.chain().focus().toggleItalic().run();
    if (mark === "underline") editor.chain().focus().toggleUnderline().run();
    if (mark === "strike") editor.chain().focus().toggleStrike().run();
    if (mark === "code") editor.chain().focus().toggleCode().run();
  };

const setAlign = (align: "left" | "center" | "right") => (editor: EditorLike) => {
  (editor?.commands as any)?.setTextAlign(align);
};

export const editorFormatActions: EditorFormatAction[] = [
  {
    id: "bold",
    label: "Bold",
    icon: BoldIcon,
    isActive: (editor) => editor?.isActive("bold") ?? false,
    run: toggleMark("bold"),
  },
  {
    id: "italic",
    label: "Italic",
    icon: ItalicIcon,
    isActive: (editor) => editor?.isActive("italic") ?? false,
    run: toggleMark("italic"),
  },
  {
    id: "underline",
    label: "Underline",
    icon: UnderlineIcon,
    isActive: (editor) => editor?.isActive("underline") ?? false,
    run: toggleMark("underline"),
  },
  {
    id: "strike",
    label: "Strike",
    icon: StrikethroughIcon,
    isActive: (editor) => editor?.isActive("strike") ?? false,
    run: toggleMark("strike"),
  },
  {
    id: "code",
    label: "Code",
    icon: CodeIcon,
    isActive: (editor) => editor?.isActive("code") ?? false,
    run: toggleMark("code"),
  },
  {
    id: "align-left",
    label: "Align left",
    icon: AlignLeftIcon,
    isActive: (editor) => editor?.isActive({ textAlign: "left" }) ?? false,
    run: setAlign("left"),
  },
  {
    id: "align-center",
    label: "Align center",
    icon: AlignCenterIcon,
    isActive: (editor) => editor?.isActive({ textAlign: "center" }) ?? false,
    run: setAlign("center"),
  },
  {
    id: "align-right",
    label: "Align right",
    icon: AlignRightIcon,
    isActive: (editor) => editor?.isActive({ textAlign: "right" }) ?? false,
    run: setAlign("right"),
  },
];
