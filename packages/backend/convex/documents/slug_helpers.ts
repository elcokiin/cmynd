/**
 * Slug management helpers for documents.
 *
 * This module manages:
 * - Slug uniqueness validation
 * - Slug redirect system (allows up to 3 valid slugs per document)
 *
 * When a 4th slug change occurs, the oldest redirect is deleted.
 */

import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Maximum number of redirects to keep per document.
 * Total valid slugs = current slug + MAX_REDIRECTS = 3 slugs.
 */
const MAX_REDIRECTS_PER_DOCUMENT = 2;

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
 * Add a slug redirect when a document's slug changes.
 *
 * This function:
 * 1. Checks if the document already has MAX_REDIRECTS
 * 2. If limit is reached, deletes the oldest redirect
 * 3. Creates a new redirect entry for the old slug
 *
 * @param ctx - Mutation context
 * @param documentId - The document ID that changed slugs
 * @param oldSlug - The previous slug to add as a redirect
 * @returns Object containing the slug that was deleted (if any)
 *
 * @example
 * const result = await addSlugRedirect(ctx, docId, "old-article-slug");
 * if (result.deletedSlug) {
 *   console.log(`Oldest slug deleted: ${result.deletedSlug}`);
 * }
 */
export async function addSlugRedirect(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  oldSlug: string,
): Promise<{ deletedSlug: string | null }> {
  // Query existing redirects for this document
  const existingRedirects = await ctx.db
    .query("slugRedirects")
    .withIndex("by_document_id", (q) => q.eq("documentId", documentId))
    .collect();

  let deletedSlug: string | null = null;

  // If we've reached the limit, delete the oldest redirect
  if (existingRedirects.length >= MAX_REDIRECTS_PER_DOCUMENT) {
    // Sort by createdAt ascending (oldest first)
    const sortedRedirects = existingRedirects.sort(
      (a, b) => a.createdAt - b.createdAt,
    );

    // Delete the oldest redirect
    const oldestRedirect = sortedRedirects[0];
    if (oldestRedirect) {
      deletedSlug = oldestRedirect.oldSlug;
      await ctx.db.delete(oldestRedirect._id);
    }
  }

  // Insert the new redirect
  await ctx.db.insert("slugRedirects", {
    oldSlug,
    documentId,
    createdAt: Date.now(),
  });

  return { deletedSlug };
}

/**
 * Check slug redirect limit before changing a document's slug.
 *
 * This function determines:
 * - How many redirects currently exist
 * - Which slug would be deleted if a new redirect is added
 *
 * Used to show confirmation dialog BEFORE making the change.
 *
 * @param ctx - Query context
 * @param documentId - The document ID to check
 * @returns Object containing the slug that would be deleted and current count
 *
 * @example
 * const check = await checkSlugRedirectLimit(ctx, docId);
 * if (check.wouldDelete) {
 *   // Show confirmation dialog: "Changing this title will break the URL: /article/${check.wouldDelete}"
 *   // User confirms or cancels
 * }
 */
export async function checkSlugRedirectLimit(
  ctx: QueryCtx,
  documentId: Id<"documents">,
): Promise<{ wouldDelete: string | null; count: number }> {
  // Query existing redirects for this document
  const existingRedirects = await ctx.db
    .query("slugRedirects")
    .withIndex("by_document_id", (q) => q.eq("documentId", documentId))
    .collect();

  const count = existingRedirects.length;

  // If we're at the limit, determine which would be deleted
  let wouldDelete: string | null = null;
  if (count >= MAX_REDIRECTS_PER_DOCUMENT) {
    // Sort by createdAt ascending (oldest first)
    const sortedRedirects = existingRedirects.sort(
      (a, b) => a.createdAt - b.createdAt,
    );

    const oldestRedirect = sortedRedirects[0];
    if (oldestRedirect) {
      wouldDelete = oldestRedirect.oldSlug;
    }
  }

  return { wouldDelete, count };
}

/**
 * Lookup a document by its old slug (redirect).
 *
 * Used when a user visits a URL with an old slug to find the current document.
 *
 * @param ctx - Query context
 * @param oldSlug - The old slug to look up
 * @returns The document ID if a redirect exists, null otherwise
 *
 * @example
 * const documentId = await getDocumentByOldSlug(ctx, "old-article-slug");
 * if (documentId) {
 *   const doc = await ctx.db.get(documentId);
 *   // Redirect user to /article/${doc.slug}
 * }
 */
export async function getDocumentByOldSlug(
  ctx: QueryCtx,
  oldSlug: string,
): Promise<Id<"documents"> | null> {
  const redirect = await ctx.db
    .query("slugRedirects")
    .withIndex("by_old_slug", (q) => q.eq("oldSlug", oldSlug))
    .unique();

  return redirect?.documentId ?? null;
}

/**
 * Delete all redirects for a document.
 *
 * Used when a document is permanently deleted to clean up orphaned redirects.
 *
 * @param ctx - Mutation context
 * @param documentId - The document ID to clean up redirects for
 * @returns Number of redirects deleted
 */
export async function deleteAllRedirectsForDocument(
  ctx: MutationCtx,
  documentId: Id<"documents">,
): Promise<number> {
  const redirects = await ctx.db
    .query("slugRedirects")
    .withIndex("by_document_id", (q) => q.eq("documentId", documentId))
    .collect();

  let deleted = 0;
  for (const redirect of redirects) {
    await ctx.db.delete(redirect._id);
    deleted++;
  }

  return deleted;
}
