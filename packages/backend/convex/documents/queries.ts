import { v } from "convex/values";
import { query } from "../_generated/server";
import { documentStatusValidator } from "../../lib/validators/documents";
import { DocumentNotFoundError } from "@elcokiin/errors/backend";
import * as Auth from "../_lib/auth";
import { getByIdForAuthor } from "./helpers";

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
 * List all documents for the current user.
 * Returns empty array if not authenticated.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await Auth.getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .order("desc")
      .take(100);
  },
});

/**
 * List documents by status for the current user.
 * Returns empty array if not authenticated (graceful handling for sign-out).
 */
export const listByStatus = query({
  args: {
    status: documentStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await Auth.getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_author_and_status", (q) =>
        q.eq("authorId", user._id).eq("status", args.status),
      )
      .order("desc")
      .take(100);
  },
});

/**
 * List all pending documents (admin only).
 * Throws AdminRequiredError if user is not an admin.
 */
export const listPendingForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);

    return await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);
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
 * Get admin statistics (admin only).
 * Returns counts of documents by status.
 * Throws AdminRequiredError if user is not an admin.
 */
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);

    // Use separate indexed queries for each status (avoids full table scan)
    const [buildingDocs, pendingDocs, publishedDocs] = await Promise.all([
      ctx.db
        .query("documents")
        .withIndex("by_status", (q) => q.eq("status", "building"))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    return {
      totalDocuments:
        buildingDocs.length + pendingDocs.length + publishedDocs.length,
      building: buildingDocs.length,
      pending: pendingDocs.length,
      published: publishedDocs.length,
    };
  },
});
