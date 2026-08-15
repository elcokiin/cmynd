import { vi } from "vitest";

// Must be hoisted before any imports
vi.hoisted(() => {
  process.env.SKIP_ENV_VALIDATION = "1";
});

import { describe, it, expect } from "vitest";
import { computePublishMetadata } from "./helpers";
import type { Doc } from "../_generated/dataModel";

function createMockDocument(overrides: Partial<Doc<"documents">> = {}): Doc<"documents"> {
  return {
    _id: "test-id" as any,
    _creationTime: Date.now(),
    title: "Test Document",
    slug: "test-document",
    content: null,
    type: "own",
    status: "building",
    authorId: "author-id" as any,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  } as Doc<"documents">;
}

describe("computePublishMetadata", () => {
  describe("description extraction", () => {
    it("should extract description from Lexical content when no manual description", () => {
      const document = createMockDocument({
        content: {
          root: {
            children: [
              {
                type: "paragraph",
                children: [
                  { type: "text", text: "This is the first paragraph of my document with enough words to create a meaningful description for testing purposes" },
                ],
              },
            ],
          },
        },
      });

      const result = computePublishMetadata(document);
      expect(result.description).not.toBe("Check out this post");
      expect(result.description).toContain("This is the first paragraph");
      expect(result.description.length).toBeGreaterThan(10);
    });

    it("should extract description from TipTap content when no manual description", () => {
      const document = createMockDocument({
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "TipTap content with enough words for description extraction testing" }],
            },
          ],
        },
      });

      const result = computePublishMetadata(document);
      expect(result.description).not.toBe("Check out this post");
      expect(result.description).toContain("TipTap content");
    });

    it("should use manual description when provided", () => {
      const document = createMockDocument({
        description: "My custom description",
        content: {
          root: {
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "Some content" }],
              },
            ],
          },
        },
      });

      const result = computePublishMetadata(document);
      expect(result.description).toBe("My custom description");
    });

    it("should use fallback when content is empty", () => {
      const document = createMockDocument({
        content: null,
      });

      const result = computePublishMetadata(document);
      expect(result.description).toBe("Check out this post");
    });

    it("should use fallback when content has no text", () => {
      const document = createMockDocument({
        content: {
          type: "doc",
          content: [],
        },
      });

      const result = computePublishMetadata(document);
      expect(result.description).toBe("Check out this post");
    });

    it("should trim whitespace from manual description", () => {
      const document = createMockDocument({
        description: "  Trimmed description  ",
      });

      const result = computePublishMetadata(document);
      expect(result.description).toBe("Trimmed description");
    });
  });

  describe("estimatedReadTime", () => {
    it("should calculate read time from Lexical content", () => {
      const words = Array.from({ length: 200 }, (_, i) => `word${i + 1}`).join(" ");
      const document = createMockDocument({
        content: {
          root: {
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", text: words }],
              },
            ],
          },
        },
      });

      const result = computePublishMetadata(document);
      expect(result.estimatedReadTime).toBeGreaterThanOrEqual(1);
    });

    it("should calculate read time from TipTap content", () => {
      const words = Array.from({ length: 400 }, (_, i) => `word${i + 1}`).join(" ");
      const document = createMockDocument({
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: words }],
            },
          ],
        },
      });

      const result = computePublishMetadata(document);
      expect(result.estimatedReadTime).toBeGreaterThanOrEqual(2);
    });

    it("should return 0 for empty content", () => {
      const document = createMockDocument({
        content: null,
      });

      const result = computePublishMetadata(document);
      expect(result.estimatedReadTime).toBe(0);
    });

    it("should never hide short non-empty content (returns at least 1)", () => {
      const words = Array.from({ length: 50 }, (_, i) => `word${i + 1}`).join(" ");
      const document = createMockDocument({
        content: {
          root: {
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", text: words }],
              },
            ],
          },
        },
      });

      const result = computePublishMetadata(document);
      expect(result.estimatedReadTime).toBe(1);
    });
  });
});
