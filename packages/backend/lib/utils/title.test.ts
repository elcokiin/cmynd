import { describe, it, expect } from "vitest";
import {
  isValidTitle,
  extractFirstHeading,
  hasContent,
  type JSONContent,
} from "./title";

describe("isValidTitle", () => {
  describe("valid titles", () => {
    it("should accept normal text", () => {
      expect(isValidTitle("My Article")).toBe(true);
      expect(isValidTitle("Getting Started with React")).toBe(true);
      expect(isValidTitle("2024 Roadmap")).toBe(true);
    });

    it("should accept titles with special characters", () => {
      expect(isValidTitle("Hello, World!")).toBe(true);
      expect(isValidTitle("React & TypeScript")).toBe(true);
      expect(isValidTitle("What's New?")).toBe(true);
    });

    it("should accept single character titles", () => {
      expect(isValidTitle("A")).toBe(true);
      expect(isValidTitle("1")).toBe(true);
    });

    it("should accept titles with leading/trailing spaces (trimmed)", () => {
      expect(isValidTitle("  Valid Title  ")).toBe(true);
      expect(isValidTitle("\tTabbed Title\t")).toBe(true);
    });
  });

  describe("invalid titles", () => {
    it("should reject 'Untitled' (case-insensitive)", () => {
      expect(isValidTitle("Untitled")).toBe(false);
      expect(isValidTitle("untitled")).toBe(false);
      expect(isValidTitle("UNTITLED")).toBe(false);
      expect(isValidTitle("UnTiTlEd")).toBe(false);
    });

    it("should reject 'Untitled' with whitespace", () => {
      expect(isValidTitle("  Untitled  ")).toBe(false);
      expect(isValidTitle("\tUntitled\n")).toBe(false);
    });

    it("should reject empty strings", () => {
      expect(isValidTitle("")).toBe(false);
    });

    it("should reject whitespace-only strings", () => {
      expect(isValidTitle("   ")).toBe(false);
      expect(isValidTitle("\t\t")).toBe(false);
      expect(isValidTitle("\n\n")).toBe(false);
      expect(isValidTitle(" \t\n ")).toBe(false);
    });
  });
});

describe("extractFirstHeading", () => {
  describe("successful extraction", () => {
    it("should extract text from h1 heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My First Heading" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("My First Heading");
    });

    it("should extract text from h2 heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Second Level Heading" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Second Level Heading");
    });

    it("should extract text from h3 heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3 },
            content: [{ type: "text", text: "Third Level Heading" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Third Level Heading");
    });

    it("should extract first heading when multiple exist", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Some intro text" }],
          },
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "First Heading" }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Second Heading" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("First Heading");
    });

    it("should extract heading with multiple text nodes", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Hello " },
              { type: "text", text: "World" },
            ],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Hello World");
    });

    it("should extract heading with nested content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Bold " },
              {
                type: "text",
                text: "text",
                marks: [{ type: "bold" }],
              },
            ],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Bold text");
    });

    it("should trim whitespace from extracted heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "  Spaced Heading  " }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Spaced Heading");
    });

    it("should truncate long headings to 200 characters", () => {
      const longText = "A".repeat(250);
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: longText }],
          },
        ],
      };

      const result = extractFirstHeading(content);
      expect(result).not.toBeNull();
      expect(result?.length).toBe(200);
      expect(result).toBe("A".repeat(200));
    });

    it("should find deeply nested heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "blockquote",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Nested Heading" }],
              },
            ],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBe("Nested Heading");
    });
  });

  describe("no heading found", () => {
    it("should return null for empty content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [],
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should return null when no content property exists", () => {
      const content: JSONContent = {
        type: "doc",
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should return null when only paragraphs exist", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Just a paragraph" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should return null for heading with no text", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should return null for heading with only whitespace", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "   " }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should ignore h4, h5, h6 headings", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "H4 Heading" }],
          },
          {
            type: "heading",
            attrs: { level: 5 },
            content: [{ type: "text", text: "H5 Heading" }],
          },
        ],
      };

      expect(extractFirstHeading(content)).toBeNull();
    });

    it("should return null for invalid content structure", () => {
      expect(extractFirstHeading(null as any)).toBeNull();
      expect(extractFirstHeading(undefined as any)).toBeNull();
      expect(extractFirstHeading({} as any)).toBeNull();
    });
  });
});

describe("hasContent", () => {
  describe("content exists", () => {
    it("should return true for paragraph with text", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello world" }],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });

    it("should return true for heading with text", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Title" }],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });

    it("should return true for single character", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "A" }],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });

    it("should return true for deeply nested text", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Nested text" }],
              },
            ],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });

    it("should return true for multiple text nodes", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "First " },
              { type: "text", text: "Second" },
            ],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });

    it("should ignore leading/trailing whitespace", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "  Text  " }],
          },
        ],
      };

      expect(hasContent(content)).toBe(true);
    });
  });

  describe("no content", () => {
    it("should return false for empty doc", () => {
      const content: JSONContent = {
        type: "doc",
        content: [],
      };

      expect(hasContent(content)).toBe(false);
    });

    it("should return false when no content property", () => {
      const content: JSONContent = {
        type: "doc",
      };

      expect(hasContent(content)).toBe(false);
    });

    it("should return false for empty paragraph", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      };

      expect(hasContent(content)).toBe(false);
    });

    it("should return false for whitespace-only text", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "   " }],
          },
        ],
      };

      expect(hasContent(content)).toBe(false);
    });

    it("should return false for multiple empty paragraphs", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      };

      expect(hasContent(content)).toBe(false);
    });

    it("should return false for invalid content", () => {
      expect(hasContent(null as any)).toBe(false);
      expect(hasContent(undefined as any)).toBe(false);
    });
  });
});
