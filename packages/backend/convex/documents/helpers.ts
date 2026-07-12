/**
 * General document helpers.
 */

import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { DocumentType } from "../../lib/types/documents";

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

/**
 * Validates that a document is editable (not published, not pending review).
 * Used by mutations that modify document content or metadata.
 */
export function assertDocumentEditable(
  document: Doc<"documents">,
): void {
  if (document.status === "published") {
    throwConvexError(ErrorCode.DOCUMENT_PUBLISHED);
  }
  if (document.status === "pending") {
    throwConvexError(ErrorCode.DOCUMENT_PENDING_REVIEW);
  }
}

/**
 * Validates that a document is not a reprint.
 * Reprint documents cannot have inspirations.
 */
export function assertNotReprint(
  document: Doc<"documents">,
): void {
  if (document.type === "reprint") {
    throwConvexError(
      ErrorCode.DOCUMENT_VALIDATION,
      "Reprint documents cannot have inspirations",
    );
  }
}

/**
 * Determines the new document type based on inspirations count.
 * - "own" + has inspirations → "inspiration"
 * - "inspiration" + no inspirations → "own"
 * - otherwise → null (no change)
 */
export function deriveDocumentTypeFromInspirations(
  currentType: DocumentType,
  inspirationCount: number,
): DocumentType | null {
  if (inspirationCount > 0 && currentType === "own") {
    return "inspiration";
  }
  if (inspirationCount === 0 && currentType === "inspiration") {
    return "own";
  }
  return null;
}
