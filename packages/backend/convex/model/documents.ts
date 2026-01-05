import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import * as Users from "./users";

export type DocumentType = "own" | "curated" | "inspiration";
export type DocumentStatus = "building" | "published";

export type CurationData = {
  sourceUrl: string;
  sourceTitle: string;
  sourceAuthor?: string;
  spin: string;
};

export type Reference = {
  url: string;
  title: string;
  author?: string;
};

export type CreateDocumentInput = {
  title: string;
  type: DocumentType;
  content?: Record<string, unknown>;
};

export type UpdateDocumentInput = {
  title?: string;
  content?: Record<string, unknown>;
  coverImageId?: Id<"_storage"> | null;
  curation?: CurationData | null;
  references?: Reference[];
};

/**
 * Create a new document.
 */
export async function create(
  ctx: MutationCtx,
  input: CreateDocumentInput,
): Promise<Id<"documents">> {
  const userId = await Users.requireAuth(ctx);

  const now = Date.now();
  return await ctx.db.insert("documents", {
    title: input.title,
    type: input.type,
    status: "building",
    authorId: userId,
    content: input.content ?? {},
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Get a document by ID.
 * Returns null if the document doesn't exist.
 */
export async function getById(ctx: QueryCtx, documentId: Id<"documents">) {
  return await ctx.db.get(documentId);
}

/**
 * Get a document by ID with author verification.
 * Throws an error if the document doesn't exist or the user is not the author.
 */
export async function getByIdForAuthor(
  ctx: QueryCtx | MutationCtx,
  documentId: Id<"documents">,
) {
  const userId = await Users.requireAuth(ctx);
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  if (document.authorId !== userId) {
    throw new Error("Unauthorized: You don't own this document");
  }

  return document;
}

/**
 * List all documents for the current user.
 * Returns empty array if not authenticated (graceful handling for sign-out).
 */
export async function listByAuthor(ctx: QueryCtx) {
  const user = await Users.getCurrentUserOrNull(ctx);
  if (!user) {
    return [];
  }

  return await ctx.db
    .query("documents")
    .withIndex("by_author", (q) => q.eq("authorId", user._id))
    .order("desc")
    .collect();
}

/**
 * List documents by status for the current user.
 * Returns empty array if not authenticated (graceful handling for sign-out).
 */
export async function listByStatus(ctx: QueryCtx, status: DocumentStatus) {
  const user = await Users.getCurrentUserOrNull(ctx);
  if (!user) {
    return [];
  }

  return await ctx.db
    .query("documents")
    .withIndex("by_author_and_status", (q) =>
      q.eq("authorId", user._id).eq("status", status),
    )
    .order("desc")
    .collect();
}

/**
 * Update a document's content.
 * Only allowed for documents in "building" status.
 */
export async function updateContent(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  content: Record<string, unknown>,
) {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new Error("Cannot edit a published document");
  }

  await ctx.db.patch(documentId, {
    content,
    updatedAt: Date.now(),
  });
}

/**
 * Update document metadata (title, cover, curation, references).
 * Only allowed for documents in "building" status.
 */
export async function updateMetadata(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  input: UpdateDocumentInput,
) {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new Error("Cannot edit a published document");
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
 * Publish a document.
 * Changes status from "building" to "published".
 */
export async function publish(ctx: MutationCtx, documentId: Id<"documents">) {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new Error("Document is already published");
  }

  // Validate required fields based on document type
  if (document.type === "curated" && !document.curation) {
    throw new Error("Curated documents must have curation data");
  }

  await ctx.db.patch(documentId, {
    status: "published",
    publishedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Delete a document.
 * Soft delete is not implemented; this is a hard delete.
 */
export async function remove(ctx: MutationCtx, documentId: Id<"documents">) {
  await getByIdForAuthor(ctx, documentId);
  await ctx.db.delete(documentId);
}
