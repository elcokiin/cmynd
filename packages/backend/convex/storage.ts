import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import * as Auth from "./_lib/auth";
import { r2 } from "./r2";

/**
 * Generate an upload URL for file storage via R2.
 * Use this to upload files directly to Cloudflare R2.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<{ key: string; url: string }> => {
    await Auth.requireAuth(ctx);
    return await r2.generateUploadUrl();
  },
});

/**
 * Get a signed URL for an R2 object.
 * Requires authentication to access storage URLs.
 */
export const getUrl = query({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<string | null> => {
    const user = await Auth.getCurrentUserOrNull(ctx);
    if (!user) {
      return null;
    }

    return await r2.getUrl(args.key, { expiresIn: 900 });
  },
});

/**
 * Get a public signed URL for an R2 object.
 * Intended for public-facing consumers (e.g. blog covers).
 * Longer expiry (1 day) since blog images are cached.
 */
export const getPublicUrl = query({
  args: { key: v.string() },
  handler: async (_ctx, args): Promise<string | null> => {
    return await r2.getUrl(args.key, { expiresIn: 86400 });
  },
});

/**
 * Delete an R2 object.
 */
export const deleteFile = mutation({
  args: { key: v.string() },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAuth(ctx);
    await r2.deleteObject(ctx, args.key);
  },
});
