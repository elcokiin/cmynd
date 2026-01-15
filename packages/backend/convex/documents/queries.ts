import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  DocumentNotFoundError,
  UnauthenticatedError,
} from "@elcokiin/errors/backend";
import type { DocumentStats } from "../../lib/types/documents";
import * as Auth from "../_lib/auth";
import {
  getByIdForAuthor,
  countByStatus,
  paginationOptsValidator,
} from "./helpers";
import {
  projectDocumentListItem,
  projectPendingDocumentListItem,
} from "./projections";

/**
 * Get a single document by ID.
 */
export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Get a document for editing (author only).
 */
export const getForEdit = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await getByIdForAuthor(ctx, args.documentId);
  },
});

/**
 * List all documents for the current user with pagination.
 * Returns projected documents
 * Throws UnauthenticatedError if not authenticated.
 */
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await Auth.getCurrentUserOrNull(ctx);
    if (!user) {
      throw new UnauthenticatedError("Please sign in to view your documents");
    }

    const result = await ctx.db
      .query("documents")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(projectDocumentListItem),
    };
  },
});

/**
 * List all pending documents for admin review with pagination.
 * Returns projected documents with minimal fields.
 *
 * Throws AdminRequiredError if user is not an admin.
 */
export const listPendingForAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const result = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(projectPendingDocumentListItem),
    };
  },
});

/**
 * Get a document for admin review (admin only).
 * Returns the full document content without author info (anonymous review).
 * Throws AdminRequiredError if user is not an admin.
 * Throws DocumentNotFoundError if document is not found or not pending.
 */
export const getForAdminReview = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document || document.status !== "pending") {
      throw new DocumentNotFoundError();
    }

    return {
      _id: document._id,
      title: document.title,
      type: document.type,
      content: document.content,
      curation: document.curation,
      references: document.references,
      coverImageId: document.coverImageId,
      submittedAt: document.submittedAt,
      createdAt: document.createdAt,
    };
  },
});

/**
 * Get recent pending documents for admin dashboard preview (admin only).
 * Returns the first N pending documents without pagination.
 *
 * Throws AdminRequiredError if user is not an admin.
 */
export const getRecentPendingForAdmin = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const limit = args.limit ?? 5;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(limit);

    return documents.map(projectPendingDocumentListItem);
  },
});

/**
 * Get admin statistics (admin only).
 * Returns counts of documents by status.
 * Throws AdminRequiredError if user is not an admin.
 */
export const getAdminStats = query({
  args: {},
  handler: async (ctx): Promise<DocumentStats> => {
    await Auth.requireAdmin(ctx);

    const [buildingCount, pendingCount, publishedCount] = await Promise.all([
      countByStatus(ctx, "building"),
      countByStatus(ctx, "pending"),
      countByStatus(ctx, "published"),
    ]);

    return {
      totalDocuments: buildingCount + pendingCount + publishedCount,
      buildingCount,
      pendingCount,
      publishedCount,
    };
  },
});
