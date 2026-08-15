import { describe, it, expect } from "vitest";
import { extractTextFromNode, extractFirstWords } from "./text-manipulation";
import type { JSONContent } from "./title";

describe("extractTextFromNode", () => {
  describe("Lexical format (root.children)", () => {
    it("should extract text from Lexical editor state", () => {
      const content = {
        root: {
          children: [
            {
              type: "paragraph",
              children: [
                { type: "text", text: "Hello world" },
              ],
            },
          ],
        },
      } as unknown as JSONContent;

      expect(extractTextFromNode(content)).toContain("Hello world");
    });

    it("should extract text from nested Lexical children", () => {
      const content = {
        root: {
          children: [
            {
              type: "paragraph",
              children: [
                { type: "text", text: "First paragraph" },
              ],
            },
            {
              type: "paragraph",
              children: [
                { type: "text", text: "Second paragraph" },
              ],
            },
          ],
        },
      } as unknown as JSONContent;

      const result = extractTextFromNode(content);
      expect(result).toContain("First paragraph");
      expect(result).toContain("Second paragraph");
    });

    it("should handle Lexical with deeply nested children", () => {
      const content = {
        root: {
          children: [
            {
              type: "quote",
              children: [
                {
                  type: "paragraph",
                  children: [
                    { type: "text", text: "Quoted text" },
                  ],
                },
              ],
            },
          ],
        },
      } as unknown as JSONContent;

      expect(extractTextFromNode(content)).toContain("Quoted text");
    });
  });

  describe("TipTap format (content)", () => {
    it("should extract text from TipTap document", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello TipTap" }],
          },
        ],
      };

      expect(extractTextFromNode(content)).toContain("Hello TipTap");
    });

    it("should extract text from nested TipTap content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My Heading" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Body text" }],
          },
        ],
      };

      const result = extractTextFromNode(content);
      expect(result).toContain("My Heading");
      expect(result).toContain("Body text");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for empty node", () => {
      const content: JSONContent = { type: "doc" };
      expect(extractTextFromNode(content)).toBe("");
    });

    it("should handle text-only node", () => {
      const content = { type: "text", text: "Just text" } as unknown as JSONContent;
      expect(extractTextFromNode(content)).toBe("Just text");
    });

    it("should handle hardBreak as space", () => {
      const content = { type: "hardBreak" } as unknown as JSONContent;
      expect(extractTextFromNode(content)).toBe(" ");
    });

    it("should handle null/undefined gracefully", () => {
      expect(extractTextFromNode(null as any)).toBe("");
      expect(extractTextFromNode(undefined as any)).toBe("");
    });

    it("should add space after block-level nodes", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "One" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Two" }],
          },
        ],
      };

      const result = extractTextFromNode(content);
      expect(result).toContain("One");
      expect(result).toContain("Two");
    });
  });
});

describe("extractFirstWords", () => {
  describe("Lexical format", () => {
    it("should extract first words from Lexical content", () => {
      const content = {
        root: {
          children: [
            {
              type: "paragraph",
              children: [
                { type: "text", text: "This is a test document with enough words to extract a summary from" },
              ],
            },
          ],
        },
      } as unknown as JSONContent;

      const result = extractFirstWords(content, 5);
      expect(result).toBe("This is a test document...");
    });

    it("should append ellipsis when content is longer than word count", () => {
      const content = {
        root: {
          children: [
            {
              type: "paragraph",
              children: [
                { type: "text", text: "One two three four five six seven eight nine ten" },
              ],
            },
          ],
        },
      } as unknown as JSONContent;

      const result = extractFirstWords(content, 3);
      expect(result).toBe("One two three...");
    });
  });

  describe("TipTap format", () => {
    it("should extract first words from TipTap content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello world this is a test" }],
          },
        ],
      };

      const result = extractFirstWords(content, 2);
      expect(result).toBe("Hello world...");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for empty content", () => {
      const content: JSONContent = { type: "doc", content: [] };
      expect(extractFirstWords(content)).toBe("");
    });

    it("should return all words when content is shorter than word count", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Short text" }],
          },
        ],
      };

      const result = extractFirstWords(content, 10);
      expect(result).toBe("Short text");
    });

    it("should use default word count of 20-25 when not specified", () => {
      const words = Array.from({ length: 30 }, (_, i) => `word${i + 1}`).join(" ");
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: words }],
          },
        ],
      };

      const result = extractFirstWords(content);
      const wordCount = result.replace("...", "").trim().split(/\s+/).length;
      expect(wordCount).toBeGreaterThanOrEqual(20);
      expect(wordCount).toBeLessThanOrEqual(25);
      expect(result).toContain("...");
    });
  });
});
