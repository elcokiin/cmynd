import type { JSONContent } from "./title";

export function extractTextFromNode(node: JSONContent): string {
  if (!node) return "";

  let text = "";

  if (node.text) {
    text += node.text;
  } else if (node.type === "hardBreak") {
    text += " ";
  }

  // Support both TipTap (content) and Lexical (children/root.children) formats
  const nodeRecord = node as Record<string, unknown>;
  const children = node.content || nodeRecord.children || nodeRecord.root;
  if (Array.isArray(children) && children.length > 0) {
    for (const child of children) {
      text += extractTextFromNode(child as JSONContent);
    }
  } else if (children && typeof children === "object" && "children" in (children as Record<string, unknown>)) {
    // Handle Lexical root object: { root: { children: [...] } }
    const rootChildren = (children as Record<string, unknown>).children;
    if (Array.isArray(rootChildren)) {
      for (const child of rootChildren) {
        text += extractTextFromNode(child as JSONContent);
      }
    }
  }

  // Add a space after block-level nodes to prevent words from merging
  if (node.type && !['text', 'hardBreak', 'doc'].includes(node.type)) {
    text += " ";
  }

  return text;
}

function getRandomWordCount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function extractFirstWords(
  content: JSONContent,
  wordCount?: number,
): string {
  const actualWordCount = wordCount ?? getRandomWordCount(20, 25);
  const text = extractTextFromNode(content);
  const words = text.trim().split(/\s+/).filter(Boolean);

  const selectedWords = words.slice(0, actualWordCount);
  let result = selectedWords.join(" ");

  if (words.length > actualWordCount) {
    result += "...";
  }

  return result;
}
