import { describe, it, expect } from "vitest";
import { generateSlug, generateSlugWithId, extractShortId } from "./slug";
import type { Id } from "../../convex/_generated/dataModel";

describe("generateSlug", () => {
  it("converts basic titles to slugs", () => {
    expect(generateSlug("My Awesome Article")).toBe("my-awesome-article");
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello! World @ 2024")).toBe("hello-world-2024");
    expect(generateSlug("Article: The Beginning")).toBe("article-the-beginning");
    expect(generateSlug("Test (Part 1)")).toBe("test-part-1");
  });

  it("handles accented characters (Latin)", () => {
    expect(generateSlug("Café")).toBe("cafe");
    expect(generateSlug("Résumé")).toBe("resume");
    expect(generateSlug("Naïve")).toBe("naive");
    expect(generateSlug("Piñata")).toBe("pinata");
  });

  it("handles ampersands", () => {
    // Note: slug package removes & by default, doesn't convert to "and"
    expect(generateSlug("Café & Bar")).toBe("cafe-bar");
    expect(generateSlug("Rock & Roll")).toBe("rock-roll");
  });

  it("trims whitespace", () => {
    expect(generateSlug("  Hello World  ")).toBe("hello-world");
    expect(generateSlug("   Spaced   Out   ")).toBe("spaced-out");
  });

  it("collapses multiple spaces into single hyphen", () => {
    expect(generateSlug("Hello    World")).toBe("hello-world");
    expect(generateSlug("Too     Many     Spaces")).toBe("too-many-spaces");
  });

  it("handles empty strings", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("   ")).toBe("");
  });

  it("handles strings with only special characters", () => {
    expect(generateSlug("!!!")).toBe("");
    expect(generateSlug("@@@")).toBe("");
    expect(generateSlug("***")).toBe("");
  });

  it("limits length to 200 characters", () => {
    const longTitle = "a".repeat(250);
    const result = generateSlug(longTitle);
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it("removes trailing hyphen after truncation", () => {
    // Create a title that ends with a word boundary at 200+ chars
    const longTitle = "word ".repeat(50) + "final";
    const result = generateSlug(longTitle);
    expect(result).not.toMatch(/-$/); // Should not end with hyphen
    expect(result.length).toBeLessThanOrEqual(200);
  });

  it("handles numbers", () => {
    expect(generateSlug("Article 123")).toBe("article-123");
    expect(generateSlug("2024 Trends")).toBe("2024-trends");
  });

  it("handles fancy quotation marks", () => {
    // This is the fix! No Unicode parsing errors
    expect(generateSlug(`Article's "Title"`)).toBe("articles-title");
    expect(generateSlug(`"Quoted Text"`)).toBe("quoted-text");
  });

  it("preserves hyphens in original text", () => {
    expect(generateSlug("well-known fact")).toBe("well-known-fact");
    expect(generateSlug("state-of-the-art")).toBe("state-of-the-art");
  });
});

describe("generateSlugWithId", () => {
  const mockId = "j97abc123def456" as Id<"documents">;

  it("appends short ID to slug", () => {
    const result = generateSlugWithId("My Article", mockId);
    expect(result).toBe("my-article-f456"); // Last 4 chars: f456
  });

  it("handles empty titles with fallback", () => {
    const result = generateSlugWithId("", mockId);
    expect(result).toBe("untitled-f456");
  });

  it("handles whitespace-only titles", () => {
    const result = generateSlugWithId("   ", mockId);
    expect(result).toBe("untitled-f456");
  });

  it("handles titles that become empty after slugification", () => {
    const result = generateSlugWithId("!!!", mockId);
    expect(result).toBe("untitled-f456");
  });

  it("handles reserved word 'document'", () => {
    const result = generateSlugWithId("document", mockId);
    expect(result).toBe("doc-f456");
  });

  it("preserves 'document' in longer titles", () => {
    const result = generateSlugWithId("My Document", mockId);
    expect(result).toBe("my-document-f456");
  });

  it("uses consistent short ID format", () => {
    const result = generateSlugWithId("Test", mockId);
    expect(result).toMatch(/^test-[a-z0-9]{4}$/);
  });

  it("handles accented characters with ID", () => {
    const result = generateSlugWithId("Café Article", mockId);
    expect(result).toBe("cafe-article-f456");
  });
});

describe("extractShortId", () => {
  it("extracts short ID from valid slug", () => {
    expect(extractShortId("my-article-c123")).toBe("c123");
    expect(extractShortId("hello-world-a1b2")).toBe("a1b2");
  });

  it("extracts short ID from untitled slug", () => {
    expect(extractShortId("untitled-f456")).toBe("f456");
  });

  it("handles slug with multiple hyphens", () => {
    expect(extractShortId("this-is-a-long-slug-x9z8")).toBe("x9z8");
  });

  it("returns empty string for invalid format (no hyphen)", () => {
    expect(extractShortId("nohyphens")).toBe("");
  });

  it("extracts valid 4-character alphanumeric strings as short IDs", () => {
    // Our extractShortId validates format, not semantics
    // Any 4-char alphanumeric string at the end is considered valid
    expect(extractShortId("just-a-word")).toBe("word"); // "word" is valid
    expect(extractShortId("article-test")).toBe("test"); // "test" is valid
    expect(extractShortId("slug-1234")).toBe("1234"); // "1234" is valid
  });

  it("returns empty string for invalid short ID lengths", () => {
    expect(extractShortId("slug-too")).toBe(""); // "too" is only 3 chars
    expect(extractShortId("slug-toolong")).toBe(""); // "toolong" is 7 chars
  });

  it("validates short ID is exactly 4 characters", () => {
    expect(extractShortId("article-abc")).toBe(""); // 3 chars
    expect(extractShortId("article-abcde")).toBe(""); // 5 chars
    expect(extractShortId("article-abcd")).toBe("abcd"); // Valid
  });

  it("validates short ID is alphanumeric", () => {
    expect(extractShortId("article-ab-c")).toBe(""); // Contains hyphen
    expect(extractShortId("article-ab_c")).toBe(""); // Contains underscore
    expect(extractShortId("article-ab!c")).toBe(""); // Contains special char
    expect(extractShortId("article-abc1")).toBe("abc1"); // Valid
  });

  it("is case-insensitive for validation", () => {
    expect(extractShortId("article-ABCD")).toBe("ABCD");
    expect(extractShortId("article-AbC1")).toBe("AbC1");
  });

  it("returns empty string for empty slug", () => {
    expect(extractShortId("")).toBe("");
  });

  it("returns empty string for single part slug", () => {
    expect(extractShortId("single")).toBe("");
  });
});

describe("integration tests", () => {
  it("roundtrip: generateSlugWithId -> extractShortId", () => {
    const mockId = "j97abc123xyz789" as Id<"documents">;
    const slug = generateSlugWithId("My Test Article", mockId);
    const shortId = extractShortId(slug);
    
    expect(shortId).toBe("z789");
    expect(slug).toBe("my-test-article-z789");
  });

  it("handles edge case: very short title with ID", () => {
    const mockId = "j97abc123" as Id<"documents">;
    const slug = generateSlugWithId("A", mockId);
    
    expect(slug).toBe("a-c123");
    expect(extractShortId(slug)).toBe("c123");
  });

  it("handles edge case: title that is just numbers", () => {
    const mockId = "test1234" as Id<"documents">;
    const slug = generateSlugWithId("123456", mockId);
    
    expect(slug).toBe("123456-1234");
    expect(extractShortId(slug)).toBe("1234");
  });
});
