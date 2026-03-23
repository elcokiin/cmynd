import { Editor } from "@tiptap/core";
import { Markdown } from "@tiptap/markdown";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "novel";

const markdownExtensions = [
  StarterKit,
  Image,
  TaskList,
  TaskItem,
  Markdown,
];

function createMarkdownEditor(content: string | JSONContent, contentType: "markdown" | "json") {
  return new Editor({
    extensions: markdownExtensions,
    content: content as any,
    contentType,
  });
}

export function markdownToJson(markdown: string): JSONContent {
  if (!markdown.trim()) {
    return { type: "doc", content: [] };
  }

  const editor = createMarkdownEditor(markdown, "markdown");
  try {
    return editor.getJSON() as JSONContent;
  } finally {
    editor.destroy();
  }
}

export function jsonToMarkdown(content?: JSONContent): string {
  if (!content || !Array.isArray(content.content)) {
    return "";
  }

  const editor = createMarkdownEditor(content, "json");
  try {
    return editor.getMarkdown().trim();
  } finally {
    editor.destroy();
  }
}

export function downloadMarkdown(filenameBase: string, markdown: string): void {
  const safeBase = filenameBase.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "document";
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeBase}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
