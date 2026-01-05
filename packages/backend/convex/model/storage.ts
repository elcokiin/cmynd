import type { Id } from "../_generated/dataModel";
import type { MutationCtx, ActionCtx } from "../_generated/server";
import * as Users from "./users";

/**
 * Generate an upload URL for file storage.
 */
export async function generateUploadUrl(ctx: MutationCtx): Promise<string> {
  await Users.requireAuth(ctx);
  return await ctx.storage.generateUploadUrl();
}

/**
 * Get a URL for a stored file.
 */
export async function getUrl(
  ctx: MutationCtx | ActionCtx,
  storageId: Id<"_storage">
): Promise<string | null> {
  return await ctx.storage.getUrl(storageId);
}

/**
 * Delete a stored file.
 */
export async function deleteFile(
  ctx: MutationCtx,
  storageId: Id<"_storage">
): Promise<void> {
  await Users.requireAuth(ctx);
  await ctx.storage.delete(storageId);
}
