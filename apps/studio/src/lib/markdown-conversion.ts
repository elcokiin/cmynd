import { generateHTML, generateJSON } from "@tiptap/html";
import {
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapLink,
  type JSONContent,
} from "novel";
import { marked } from "marked";
import TurndownService from "turndown/lib/turndown.browser.es.js";

const markdownExtensions = [
  StarterKit,
  TiptapImage,
  TiptapLink,
  TaskList,
  TaskItem,
];

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

turndown.addRule("horizontalRule", {
  filter: "hr",
  replacement: () => "\n\n---\n\n",
});

export function markdownToJson(markdown: string): JSONContent {
  if (!markdown.trim()) {
    return { type: "doc", content: [] };
  }

  const html = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
  }) as string;

  return generateJSON(html, markdownExtensions as any) as JSONContent;
}

export function jsonToMarkdown(content?: JSONContent): string {
  if (!content || !Array.isArray(content.content)) {
    return "";
  }

  const html = generateHTML(content as any, markdownExtensions as any);
  return turndown.turndown(html).trim();
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
