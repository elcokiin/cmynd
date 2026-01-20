import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Auth from "./_lib/auth";

/**
 * Generate an upload URL for file storage.
 * Use this to upload files directly to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    await Auth.requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a URL for a stored file.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<string | null> => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a stored file.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAuth(ctx);
    await ctx.storage.delete(args.storageId);
  },
});
