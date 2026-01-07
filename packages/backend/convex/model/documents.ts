import type { Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type {
  DocumentType,
  DocumentStatus,
  CurationData,
  Reference,
} from "../../lib/types/documents";
import * as Users from "./users";

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
 * Returns empty array if not authenticated.
 * */
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
 * Update document type.
 * Only allowed for documents in "building" status.
 */
export async function updateType(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  type: DocumentType,
) {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new Error("Cannot change type of a published document");
  }

  if (document.status === "pending") {
    throw new Error("Cannot edit a document that is pending review");
  }

  await ctx.db.patch(documentId, {
    type,
    updatedAt: Date.now(),
  });
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

  if (document.status === "pending") {
    throw new Error("Cannot edit a document that is pending review");
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

  if (document.status === "pending") {
    throw new Error("Cannot edit a document that is pending review");
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

  // Validate required fields
  if (!document.title || document.title.trim() === "") {
    throw new Error("Document must have a title to be published");
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
 * Submit a document for review.
 * Changes status from "building" to "pending".
 * Includes rate limiting: max 3 submissions per 24 hours.
 */
export async function submit(ctx: MutationCtx, documentId: Id<"documents">) {
  const document = await getByIdForAuthor(ctx, documentId);

  if (document.status === "published") {
    throw new Error("Document is already published");
  }

  if (document.status === "pending") {
    throw new Error("Document is already pending review");
  }

  // Validate required fields
  if (!document.title || document.title.trim() === "") {
    throw new Error("Document must have a title to be submitted");
  }

  // Validate required fields based on document type
  if (document.type === "curated" && !document.curation) {
    throw new Error("Curated documents must have curation data");
  }

  // Rate limiting: check submission history
  const submissionHistory = document.submissionHistory ?? [];
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Filter submissions in the last 24 hours
  const recentSubmissions = submissionHistory.filter(
    (timestamp) => timestamp > twentyFourHoursAgo,
  );

  if (recentSubmissions.length >= 3) {
    throw new Error(
      "Rate limit exceeded: You can only submit a document 3 times per 24 hours",
    );
  }

  // Update submission history
  const updatedHistory = [...submissionHistory, now];

  await ctx.db.patch(documentId, {
    status: "pending",
    submittedAt: now,
    submissionHistory: updatedHistory,
    rejectionReason: undefined, // Clear previous rejection reason
    updatedAt: now,
  });
}

/**
 * Approve a document (admin only).
 * Changes status from "pending" to "published".
 */
export async function approve(ctx: MutationCtx, documentId: Id<"documents">) {
  await Users.requireAdmin(ctx);

  const document = await ctx.db.get(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  if (document.status !== "pending") {
    throw new Error("Only pending documents can be approved");
  }

  await ctx.db.patch(documentId, {
    status: "published",
    publishedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Reject a document (admin only).
 * Changes status from "pending" back to "building" with a rejection reason.
 */
export async function reject(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  reason: string,
) {
  await Users.requireAdmin(ctx);

  const document = await ctx.db.get(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  if (document.status !== "pending") {
    throw new Error("Only pending documents can be rejected");
  }

  if (!reason || reason.trim() === "") {
    throw new Error("Rejection reason is required");
  }

  await ctx.db.patch(documentId, {
    status: "building",
    rejectionReason: reason,
    updatedAt: Date.now(),
  });
}

/**
 * List all pending documents for admin review.
 * Returns null if user is not an admin.
 */
export async function listPendingForAdmin(ctx: QueryCtx) {
  const isUserAdmin = await Users.isAdmin(ctx);
  if (!isUserAdmin) {
    return null;
  }

  return await ctx.db
    .query("documents")
    .withIndex("by_status", (q) => q.eq("status", "pending"))
    .order("desc")
    .collect();
}

/**
 * Get admin statistics.
 * Returns counts of documents by status.
 * Returns null if user is not an admin.
 */
export async function getAdminStats(ctx: QueryCtx) {
  const isUserAdmin = await Users.isAdmin(ctx);
  if (!isUserAdmin) {
    return null;
  }

  const allDocuments = await ctx.db.query("documents").collect();

  const stats = {
    totalDocuments: allDocuments.length,
    building: 0,
    pending: 0,
    published: 0,
  };

  for (const doc of allDocuments) {
    stats[doc.status]++;
  }

  return stats;
}

/**
 * Delete a document.
 * Soft delete is not implemented; this is a hard delete.
 */
export async function remove(ctx: MutationCtx, documentId: Id<"documents">) {
  await getByIdForAuthor(ctx, documentId);
  await ctx.db.delete(documentId);
}
