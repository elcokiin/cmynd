import { v } from "convex/values";
import { query } from "../_generated/server";
import { documentStatusValidator } from "../../lib/validators/documents";
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
      .collect();
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
      .collect();
  },
});

/**
 * List all pending documents (admin only).
 * Returns null if user is not an admin.
 */
export const listPendingForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const isUserAdmin = await Auth.isAdmin(ctx);
    if (!isUserAdmin) {
      return null;
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

/**
 * Get admin statistics (admin only).
 * Returns counts of documents by status.
 * Returns null if user is not an admin.
 */
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const isUserAdmin = await Auth.isAdmin(ctx);
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
  },
});
