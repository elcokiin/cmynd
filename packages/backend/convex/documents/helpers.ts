import type { Id, Doc } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type {
  CurationData,
  Reference,
  DocumentStatus,
} from "../../lib/types/documents";
import * as Auth from "../_lib/auth";
import {
  DocumentNotFoundError,
  DocumentOwnershipError,
  DocumentPublishedError,
  DocumentPendingReviewError,
} from "@elcokiin/errors/backend";

export { paginationOptsValidator } from "convex/server";

/**
 * Input type for updating document metadata.
 */
export type UpdateDocumentInput = {
  title?: string;
  content?: Record<string, unknown>;
  coverImageId?: Id<"_storage"> | null;
  curation?: CurationData | null;
  references?: Reference[];
};

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
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new DocumentNotFoundError();
  }

  if (document.authorId !== userId) {
    throw new DocumentOwnershipError();
  }

  return document;
}

/**
 * Update document metadata (title, cover, curation, references).
 * Only allowed for documents in "building" status.
 *
 * Used by: updateTitle, updateMetadata mutations
 */
export async function updateMetadata(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  input: UpdateDocumentInput,
): Promise<void> {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new DocumentPublishedError();
  }

  if (document.status === "pending") {
    throw new DocumentPendingReviewError();
  }

  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  if (input.title !== undefined) {
    updates.title = input.title;
  }

  if (input.content !== undefined) {
    updates.content = input.content;
  }

  if (input.coverImageId !== undefined) {
    updates.coverImageId = input.coverImageId ?? undefined;
  }

  if (input.curation !== undefined) {
    updates.curation = input.curation ?? undefined;
  }

  if (input.references !== undefined) {
    updates.references = input.references;
  }

  await ctx.db.patch(documentId, updates);
}

/**
 * Count documents by status without loading full document data.
 * Uses async iteration to count efficiently.
 *
 * @param ctx - Query context
 * @param status - Document status to count
 * @returns Total count of documents with the given status
 *
 * Used by: getAdminStats query
 */
export async function countByStatus(
  ctx: QueryCtx,
  status: DocumentStatus,
): Promise<number> {
  let count = 0;
  const iterator = ctx.db
    .query("documents")
    .withIndex("by_status", (q) => q.eq("status", status));

  for await (const _doc of iterator) {
    count++;
  }

  return count;
}