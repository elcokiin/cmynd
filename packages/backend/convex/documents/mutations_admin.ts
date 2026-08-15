import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import * as Auth from "../_lib/auth";
import { computePublishMetadata } from "./helpers";
import { updateStatusCount } from "./stats_helpers";
import { countWords, upsertActivity } from "../streaks/helpers";

/**
 * Approve a document (admin only).
 * Changes status from "pending" to "published".
 */
export const approve = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only pending documents can be approved",
      );
    }

    if (!document.coverImage?.storageId) {
      throwConvexError(ErrorCode.DOCUMENT_COVER_REQUIRED);
    }

    const { estimatedReadTime, description } =
      computePublishMetadata(document);

    await ctx.db.patch(args.documentId, {
      status: "published",
      isVisible: true,
      publishedAt: Date.now(),
      order: Date.now(),
      estimatedReadTime,
      description,
      updatedAt: Date.now(),
    });

    // Update status counts (pending -> published)
    await updateStatusCount(ctx, "pending", "published");

    // Tag the publish day with the document's word count and type for the heatmap.
    await upsertActivity(ctx, document.authorId, {
      words: countWords(document.content),
      publishType: document.type,
      documentId: document._id,
    });
  },
});

/**
 * Reject a document (admin only).
 * Changes status from "pending" back to "building" with a rejection reason.
 */
export const reject = mutation({
  args: {
    documentId: v.id("documents"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "pending") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only pending documents can be rejected",
      );
    }

    if (!args.reason || args.reason.trim() === "") {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Rejection reason is required",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "building",
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });

    // Update status counts (pending -> building)
    await updateStatusCount(ctx, "pending", "building");
  },
});

/**
 * Move a published document back to pending (admin only).
 * Changes status from "published" to "pending".
 */
export const moveBackToPending = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "published") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only published documents can be moved back to pending",
      );
    }

    await ctx.db.patch(args.documentId, {
      status: "pending",
      publishedAt: undefined,
      updatedAt: Date.now(),
    });

    // Update status counts (published -> pending)
    await updateStatusCount(ctx, "published", "pending");
  },
});

/**
 * Set visibility for a published document (admin only).
 * Keeps status as "published" and controls whether it is shown publicly.
 */
export const setPublishedVisibility = mutation({
  args: {
    documentId: v.id("documents"),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "published") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only published documents can have visibility changed",
      );
    }

    await ctx.db.patch(args.documentId, {
      isVisible: args.isVisible,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Move a published document up or down in the blog rendering order (admin only).
 * Swaps the document's order value with its adjacent published neighbor.
 * No-op if the document is already at the requested boundary.
 */
export const reorderPublished = mutation({
  args: {
    documentId: v.id("documents"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND);
    }

    if (document.status !== "published") {
      throwConvexError(
        ErrorCode.DOCUMENT_INVALID_STATUS,
        "Only published documents can be reordered",
      );
    }

    if (typeof document.order !== "number") {
      throwConvexError(
        ErrorCode.DOCUMENT_VALIDATION,
        "Document is missing an order value",
      );
    }

    const neighbor =
      args.direction === "up"
        ? await ctx.db
            .query("documents")
            .withIndex("by_published_order", (idx) =>
              idx.eq("status", "published").gt("order", document.order),
            )
            .order("asc")
            .first()
        : await ctx.db
            .query("documents")
            .withIndex("by_published_order", (idx) =>
              idx.eq("status", "published").lt("order", document.order),
            )
            .order("desc")
            .first();

    if (!neighbor) {
      return;
    }

    await ctx.db.patch(args.documentId, { order: neighbor.order });
    await ctx.db.patch(neighbor._id, { order: document.order });
  },
});
