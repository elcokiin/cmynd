/**
 * Title validation and extraction utilities for document management.
 *
 * This module provides functions to:
 * - Validate document titles (reject "Untitled", empty, or whitespace-only)
 * - Extract first heading from TipTap/Novel.js editor JSON content
 * - Check if content has meaningful text
 */

/**
 * TipTap/Novel.js JSON content structure.
 */
export type JSONContent = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

/**
 * Maximum characters allowed for auto-extracted titles.
 */
const MAX_TITLE_LENGTH = 200;

/**
 * Validate if a title is acceptable for document creation/update.
 *
 * A valid title must:
 * - Not be empty or whitespace-only
 * - Not be "Untitled" (case-insensitive)
 *
 * @param title - The title string to validate
 * @returns true if title is valid, false otherwise
 *
 * @example
 * isValidTitle("My Article") // true
 * isValidTitle("Untitled") // false
 * isValidTitle("") // false
 * isValidTitle("   ") // false
 */
export function isValidTitle(title: string): boolean {
  const trimmed = title.trim().toLowerCase();
  return trimmed !== "" && trimmed !== "untitled";
}

/**
 * Extract text content from a TipTap node recursively.
 *
 * @param node - The JSON content node to extract text from
 * @returns Concatenated text content
 */
function extractTextFromNode(node: JSONContent): string {
  let text = "";

  // If this node has direct text content, add it
  if (node.text) {
    text += node.text;
  }

  // Recursively extract text from child nodes
  if (node.content && node.content.length > 0) {
    for (const child of node.content) {
      text += extractTextFromNode(child);
    }
  }

  return text;
}

/**
 * Extract the first heading (h1, h2, or h3) text from editor JSON content.
 *
 * This function traverses the TipTap/Novel.js JSON structure to find the first
 * heading node and extracts its text content. Useful for auto-generating titles
 * from document content.
 *
 * @param content - The TipTap/Novel.js JSON content structure
 * @returns The first heading text (trimmed, max 200 chars) or null if not found
 *
 * @example
 * const content = {
 *   type: "doc",
 *   content: [
 *     {
 *       type: "heading",
 *       attrs: { level: 1 },
 *       content: [{ type: "text", text: "My First Heading" }]
 *     }
 *   ]
 * };
 * extractFirstHeading(content) // "My First Heading"
 */
export function extractFirstHeading(content: JSONContent): string | null {
  // Handle empty or invalid content
  if (!content || !content.content || content.content.length === 0) {
    return null;
  }

  // Recursively search for first heading
  function findHeading(node: JSONContent): string | null {
    // Check if this node is a heading (h1, h2, or h3)
    if (node.type === "heading" && node.attrs) {
      const level = node.attrs.level;
      if (level === 1 || level === 2 || level === 3) {
        const text = extractTextFromNode(node).trim();
        if (text) {
          // Truncate to max length if needed
          return text.length > MAX_TITLE_LENGTH
            ? text.substring(0, MAX_TITLE_LENGTH).trim()
            : text;
        }
      }
    }

    // Recursively search child nodes
    if (node.content && node.content.length > 0) {
      for (const child of node.content) {
        const result = findHeading(child);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  return findHeading(content);
}

/**
 * Check if editor content has any meaningful text.
 *
 * This function determines whether the content contains any non-empty text nodes.
 * Useful for validating that a document isn't completely empty before saving.
 *
 * @param content - The TipTap/Novel.js JSON content structure
 * @returns true if content has any text, false otherwise
 *
 * @example
 * const emptyContent = { type: "doc", content: [] };
 * hasContent(emptyContent) // false
 *
 * const textContent = {
 *   type: "doc",
 *   content: [
 *     { type: "paragraph", content: [{ type: "text", text: "Hello" }] }
 *   ]
 * };
 * hasContent(textContent) // true
 */
export function hasContent(content: JSONContent): boolean {
  // Handle empty or invalid content
  if (!content) {
    return false;
  }

  // Recursively check for text content
  function hasTextContent(node: JSONContent): boolean {
    // If this node has non-empty text, return true
    if (node.text && node.text.trim() !== "") {
      return true;
    }

    // Recursively check child nodes
    if (node.content && node.content.length > 0) {
      for (const child of node.content) {
        if (hasTextContent(child)) {
          return true;
        }
      }
    }

    return false;
  }

  return hasTextContent(content);
}
