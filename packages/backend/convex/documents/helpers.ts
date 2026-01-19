/**
 * General document helpers.
 */

import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

import * as Auth from "../_lib/auth";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";

export { paginationOptsValidator } from "convex/server";

/**
 * Get a document by ID with author verification.
 * Throws an error if the document doesn't exist or the user is not the author.
 *
 * Used by: getForEdit, updateType, updateContent, updateMetadata, publish, submit, remove
 */
export async function getByIdForAuthor(
  ctx: QueryCtx | MutationCtx,
  documentId: Id<"documents">,
) {
  const userId = await Auth.requireAuth(ctx);
  const document = await ctx.db.get("documents", documentId);

  if (!document) {
    throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
  }

  const author = await ctx.db.get("authors", document.authorId);
  if (!author || author.userId !== userId) {
    throwConvexError(ErrorCode.DOCUMENT_OWNERSHIP);
  }

  return document;
}
