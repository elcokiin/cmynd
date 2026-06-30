import type { JSONContent } from "./title";

export function extractTextFromNode(node: JSONContent): string {
  let text = "";

  if (node.text) {
    text += node.text;
  } else if (node.type === "hardBreak") {
    text += " ";
  }

  if (node.content && node.content.length > 0) {
    for (const child of node.content) {
      text += extractTextFromNode(child);
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
