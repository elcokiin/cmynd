import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

/**
 * One-off data migration: backfill the `order` field for published documents.
 *
 * Previously published documents have no `order`, so they are invisible to the
 * `by_published_order` index used by the published listings. This assigns
 * `order = publishedAt` to preserve their existing relative order (newest first).
 *
 * Run once: `npx convex run internal.documents.internal.backfillPublishedOrder`
 *
 * Idempotent: only patches documents that are published, have a `publishedAt`,
 * and do not yet have an `order`.
 */
export const backfillPublishedOrder = internalMutation({
  args: { cursor: v.optional(v.string()) },
  handler: async (ctx, { cursor }) => {
    const result = await ctx.db
      .query("documents")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("asc")
      .paginate({ numItems: 100, cursor: cursor ?? null });

    for (const doc of result.page) {
      if (doc.publishedAt && typeof doc.order !== "number") {
        await ctx.db.patch(doc._id, { order: doc.publishedAt });
      }
    }

    if (!result.isDone) {
      await ctx.scheduler.runAfter(
        0,
        internal.documents.internal.backfillPublishedOrder,
        { cursor: result.continueCursor },
      );
    }
  },
});