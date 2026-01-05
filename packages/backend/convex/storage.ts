import { v } from "convex/values";
import { mutation } from "./_generated/server";
import * as Storage from "./model/storage";

/**
 * Generate an upload URL for file storage.
 * Use this to upload files directly to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await Storage.generateUploadUrl(ctx);
  },
});

/**
 * Get a URL for a stored file.
 */
export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await Storage.getUrl(ctx, args.storageId);
  },
});

/**
 * Delete a stored file.
 */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await Storage.deleteFile(ctx, args.storageId);
  },
});
