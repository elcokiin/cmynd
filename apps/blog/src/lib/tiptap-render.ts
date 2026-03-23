import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import sanitizeHtml from "sanitize-html";

const extensions = [
  StarterKit,
  Link,
  Image,
  TaskList,
  TaskItem.configure({ nested: true }),
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
];

const SANITIZE_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "blockquote",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "s",
    "u",
    "code",
    "pre",
    "hr",
    "a",
    "img",
    "span",
    "br",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    span: ["style"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedStyles: {
    span: {
      color: [/^#[0-9a-fA-F]{3,8}$/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/],
    },
  },
};

export function renderRichContent(content: unknown): string {
  if (!content || typeof content !== "object") {
    return "";
  }

  const raw = generateHTML(content as Record<string, unknown>, extensions);
  return sanitizeHtml(raw, SANITIZE_CONFIG);
}
