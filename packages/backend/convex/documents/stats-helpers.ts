/**
 * Document statistics helpers for O(1) count lookups.
 *
 * This module manages a singleton stats table that tracks document counts
 * by status (building, pending, published). Counts are updated atomically
 * by document mutations.
 */

import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { DocumentStatus } from "../../lib/types/documents";

/**
 * Get the document stats record, creating it if it doesn't exist.
 * Returns the stats record for reading.
 *
 * @param ctx - Query or Mutation context
 * @returns The document stats record
 */
export async function getDocumentStats(ctx: QueryCtx | MutationCtx) {
  const stats = await ctx.db.query("documentStats").first();

  if (stats) {
    return stats;
  }

  // Stats don't exist yet, return defaults
  return {
    _id: null,
    buildingCount: 0,
    pendingCount: 0,
    publishedCount: 0,
    updatedAt: Date.now(),
  };
}

/**
 * Get or create the document stats record for mutation.
 * Creates the record if it doesn't exist.
 *
 * @param ctx - Mutation context
 * @returns The stats record ID
 */
async function getOrCreateStatsId(ctx: MutationCtx) {
  const stats = await ctx.db.query("documentStats").first();

  if (stats) {
    return stats._id;
  }

  // Create initial stats record
  return await ctx.db.insert("documentStats", {
    buildingCount: 0,
    pendingCount: 0,
    publishedCount: 0,
    updatedAt: Date.now(),
  });
}

/**
 * Increment the count for a specific document status.
 *
 * @param ctx - Mutation context
 * @param status - The document status to increment
 */
export async function incrementStatusCount(
  ctx: MutationCtx,
  status: DocumentStatus,
): Promise<void> {
  const statsId = await getOrCreateStatsId(ctx);
  const stats = await ctx.db.get(statsId);

  if (!stats) return;

  const field = getCountField(status);
  await ctx.db.patch(statsId, {
    [field]: stats[field] + 1,
    updatedAt: Date.now(),
  });
}

/**
 * Decrement the count for a specific document status.
 * Ensures count never goes below 0.
 *
 * @param ctx - Mutation context
 * @param status - The document status to decrement
 */
export async function decrementStatusCount(
  ctx: MutationCtx,
  status: DocumentStatus,
): Promise<void> {
  const statsId = await getOrCreateStatsId(ctx);
  const stats = await ctx.db.get(statsId);

  if (!stats) return;

  const field = getCountField(status);
  await ctx.db.patch(statsId, {
    [field]: Math.max(0, stats[field] - 1),
    updatedAt: Date.now(),
  });
}

/**
 * Update counts when a document changes status.
 * Decrements the old status count and increments the new status count.
 *
 * @param ctx - Mutation context
 * @param oldStatus - The previous document status
 * @param newStatus - The new document status
 */
export async function updateStatusCount(
  ctx: MutationCtx,
  oldStatus: DocumentStatus,
  newStatus: DocumentStatus,
): Promise<void> {
  if (oldStatus === newStatus) return;

  const statsId = await getOrCreateStatsId(ctx);
  const stats = await ctx.db.get(statsId);

  if (!stats) return;

  const oldField = getCountField(oldStatus);
  const newField = getCountField(newStatus);

  await ctx.db.patch(statsId, {
    [oldField]: Math.max(0, stats[oldField] - 1),
    [newField]: stats[newField] + 1,
    updatedAt: Date.now(),
  });
}

/**
 * Get the field name for a document status.
 */
function getCountField(
  status: DocumentStatus,
): "buildingCount" | "pendingCount" | "publishedCount" {
  switch (status) {
    case "building":
      return "buildingCount";
    case "pending":
      return "pendingCount";
    case "published":
      return "publishedCount";
  }
}
