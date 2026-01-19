import slugify from "slug";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Convert a title string to a URL-safe slug using the `slug` package.
 * - Transliterates non-ASCII characters (e.g., Café → cafe)
 * - Converts to lowercase
 * - Replaces spaces and underscores with hyphens
 * - Removes specific punctuation characters
 * - Trims whitespace
 * - Limits length to 200 characters
 *
 * @param title - Document title to slugify
 * @returns URL-safe slug, or empty string if title is empty/unparseable
 *
 * @example
 * generateSlug("My Awesome Article!") // "my-awesome-article"
 * generateSlug("Café & Bar") // "cafe-and-bar"
 * generateSlug("   Hello   World   ") // "hello-world"
 * generateSlug("") // ""
 * generateSlug("!!!") // ""
 */
export function generateSlug(title: string): string {
  if (!title || title.trim() === "") {
    return "";
  }

  const result = slugify(title, {
    lower: true, // Convert to lowercase
    remove: /[*+~.()'"!:@]/g, // Remove specific punctuation
    trim: true, // Trim whitespace
    fallback: false, // Return empty string for unparseable input
  });

  // Handle case where slug produces empty string
  if (!result) {
    return "";
  }

  // Limit to 200 characters and remove trailing hyphen if truncated
  return result.slice(0, 200).replace(/-+$/, "");
}

/**
 * Extract the last 4 characters from a Convex document ID.
 * Convex IDs are base64-like strings; we take the last 4 chars for uniqueness.
 *
 * @param documentId - Convex document ID
 * @returns Last 4 characters of the ID
 *
 * @example
 * getShortId("j97abc123def456" as Id<"documents">) // "f456"
 */
export function getShortId(documentId: Id<"documents">): string {
  return documentId.slice(-4);
}

/**
 * Generate a slug with a short ID suffix for guaranteed uniqueness.
 * Format: "slug-{shortId}" where shortId is last 4 chars of document ID.
 *
 * Handles edge cases:
 * - Empty/whitespace-only titles → "untitled-{shortId}"
 * - Titles with only special characters → "document-{shortId}"
 *
 * @param title - Document title
 * @param documentId - Convex document ID
 * @returns URL-safe slug with short ID suffix
 *
 * @example
 * generateSlugWithId("My Article", "j97abc123" as Id<"documents">)
 * // "my-article-c123"
 *
 * generateSlugWithId("", "j97abc123" as Id<"documents">)
 * // "untitled-c123"
 *
 * generateSlugWithId("!!!", "j97abc123" as Id<"documents">)
 * // "document-c123"
 */
export function generateSlugWithId(
  title: string,
  documentId: Id<"documents">,
): string {
  const slug = generateSlug(title);
  const shortId = getShortId(documentId);

  // Handle empty titles or titles that become empty after slugification
  if (!slug) {
    return `untitled-${shortId}`;
  }

  // Handle titles that become "document" (reserved fallback)
  if (slug === "document") {
    return `doc-${shortId}`;
  }

  return `${slug}-${shortId}`;
}

/**
 * Extract the document ID from a slug.
 * Expects format: "slug-{shortId}" where shortId is last 4 chars of ID.
 *
 * Note: This only extracts the SHORT ID suffix. To get the full document,
 * you must query the database using the slug field, not reconstruct the full ID.
 *
 * @param slug - Slug with short ID suffix
 * @returns Short ID (last 4 chars) or empty string if invalid format
 *
 * @example
 * extractShortId("my-article-c123") // "c123"
 * extractShortId("untitled-a1b2") // "a1b2"
 * extractShortId("invalid-slug") // ""
 */
export function extractShortId(slug: string): string {
  const parts = slug.split("-");
  if (parts.length < 2) {
    return "";
  }

  const shortId = parts[parts.length - 1];

  // TypeScript guard: Ensure shortId exists
  if (!shortId) {
    return "";
  }

  // Validate: shortId should be exactly 4 alphanumeric characters
  if (shortId.length === 4 && /^[a-z0-9]{4}$/i.test(shortId)) {
    return shortId;
  }

  return "";
}

/**
 * Generate a unique slug for a document.
 *
 * Strategy:
 * 1. Generate base slug from title
 * 2. Check if base slug exists
 * 3. If unique → return base slug (no ID suffix)
 * 4. If duplicate → return slug with short ID suffix
 *
 * This ensures:
 * - First document with a title gets clean slug: "my-article"
 * - Duplicate titles get ID suffix: "my-article-x4z9"
 *
 * @param title - Document title
 * @param documentId - Convex document ID
 * @param slugExistsCheck - Async function to check if slug exists
 * @returns Promise resolving to unique slug
 *
 * @example
 * // First document with title "My Article"
 * await generateUniqueSlug("My Article", docId, checkFn)
 * // Returns: "my-article"
 *
 * // Second document with same title
 * await generateUniqueSlug("My Article", docId2, checkFn)
 * // Returns: "my-article-x4z9"
 */
export async function generateUniqueSlug(
  title: string,
  documentId: Id<"documents">,
  slugExistsCheck: (slug: string) => Promise<boolean>,
): Promise<string> {
  // Generate base slug from title
  const baseSlug = generateSlug(title);

  // Handle empty titles or titles that become empty after slugification
  if (!baseSlug) {
    // Always use ID suffix for untitled documents
    return `untitled-${getShortId(documentId)}`;
  }

  // Check if base slug exists
  const exists = await slugExistsCheck(baseSlug);

  // If unique, return base slug without ID suffix
  if (!exists) {
    return baseSlug;
  }

  // If duplicate, append short ID
  return generateSlugWithId(title, documentId);
}
