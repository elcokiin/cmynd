/**
 * Slug management helpers for documents.
 *
 * This module manages:
 * - Slug uniqueness validation
 * - Slug history management (embedded array in documents, max 3 entries)
 *
 * When a 4th slug change occurs, the oldest entry is removed (FIFO).
 */

import type { QueryCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

/**
 * Maximum number of old slugs to keep in history.
 * Total valid slugs = current slug + MAX_SLUG_HISTORY = 4 slugs accessible.
 */
const MAX_SLUG_HISTORY = 3;

type SlugHistoryEntry = {
  slug: string;
  createdAt: number;
};

/**
 * Check if a slug already exists in the database.
 * Optionally exclude a specific document from the check.
 *
 * @param ctx - Query context
 * @param slug - The slug to check for existence
 * @param excludeDocumentId - Optional document ID to exclude from the check
 * @returns true if slug exists (on a different document), false otherwise
 *
 * Used by: create and updateTitle mutations to ensure slug uniqueness
 *
 * @example
 * // Check if "my-article" exists
 * const exists = await slugExists(ctx, "my-article");
 *
 * // Check if "my-article" exists, ignoring the current document
 * const exists = await slugExists(ctx, "my-article", currentDocId);
 */
export async function slugExists(
  ctx: QueryCtx,
  slug: string,
  excludeDocumentId?: Id<"documents">,
): Promise<boolean> {
  const existingDoc = await ctx.db
    .query("documents")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  if (!existingDoc) {
    return false;
  }

  // If we're excluding a document (updating existing), check if it's the same one
  if (excludeDocumentId && existingDoc._id === excludeDocumentId) {
    return false;
  }

  return true;
}

/**
 * Add a slug to the document's history when the slug changes.
 * Implements FIFO queue with max 3 entries.
 *
 * This is a pure function that returns the new history array.
 * The caller is responsible for patching the document.
 *
 * @param currentHistory - The document's current slugHistory array
 * @param oldSlug - The previous slug to add to history
 * @returns Object containing the new history array and any deleted slug
 *
 * @example
 * const { newHistory, deletedSlug } = addToSlugHistory(document.slugHistory, document.slug);
 * if (deletedSlug) {
 *   console.log(`Oldest slug deleted: ${deletedSlug}`);
 * }
 * await ctx.db.patch(documentId, { slugHistory: newHistory, slug: newSlug });
 */
export function addToSlugHistory(
  currentHistory: SlugHistoryEntry[] | undefined,
  oldSlug: string,
): { newHistory: SlugHistoryEntry[]; deletedSlug: string | null } {
  const history = currentHistory ? [...currentHistory] : [];
  let deletedSlug: string | null = null;

  // If we've reached the limit, remove the oldest entry
  if (history.length >= MAX_SLUG_HISTORY) {
    // Sort by createdAt ascending (oldest first)
    history.sort((a, b) => a.createdAt - b.createdAt);

    const oldest = history.shift();
    if (oldest) {
      deletedSlug = oldest.slug;
    }
  }

  // Add the new entry
  history.push({
    slug: oldSlug,
    createdAt: Date.now(),
  });

  return { newHistory: history, deletedSlug };
}

/**
 * Check what slug would be deleted if a new one is added.
 *
 * Used to show confirmation dialog BEFORE making the change.
 *
 * @param currentHistory - The document's current slugHistory array
 * @returns Object containing the slug that would be deleted and current count
 *
 * @example
 * const check = checkSlugHistoryLimit(document.slugHistory);
 * if (check.wouldDelete) {
 *   // Show confirmation: "Changing title will break URL: /editor/${check.wouldDelete}"
 * }
 */
export function checkSlugHistoryLimit(
  currentHistory: SlugHistoryEntry[] | undefined,
): { wouldDelete: string | null; count: number } {
  const history = currentHistory ?? [];
  const count = history.length;

  let wouldDelete: string | null = null;
  if (count >= MAX_SLUG_HISTORY) {
    const sorted = [...history].sort((a, b) => a.createdAt - b.createdAt);
    const oldest = sorted[0];
    if (oldest) {
      wouldDelete = oldest.slug;
    }
  }

  return { wouldDelete, count };
}

/**
 * Lookup a document by its old slug from the slug history.
 * Uses a table scan since we can't index array fields.
 *
 * This is acceptable performance since:
 * 1. Slug redirects are infrequent (only when users access old URLs)
 * 2. The documents table is typically bounded
 *
 * @param ctx - Query context
 * @param oldSlug - The old slug to look up
 * @returns The document if found via old slug, null otherwise
 *
 * @example
 * const document = await getDocumentByOldSlug(ctx, "old-article-slug");
 * if (document) {
 *   // Redirect user to /editor/${document.slug}
 * }
 */
export async function getDocumentByOldSlug(
  ctx: QueryCtx,
  oldSlug: string,
): Promise<Doc<"documents"> | null> {
  // Query all documents and filter by slugHistory
  // This is acceptable as slug redirects are infrequent
  const documents = await ctx.db.query("documents").collect();

  for (const doc of documents) {
    if (doc.slugHistory?.some((entry) => entry.slug === oldSlug)) {
      return doc;
    }
  }

  return null;
}
