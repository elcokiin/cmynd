import type { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";

/**
 * Get the current authenticated user.
 * Throws an error if the user is not authenticated.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Get the current authenticated user or null if not authenticated.
 */
export async function getCurrentUserOrNull(ctx: QueryCtx | MutationCtx) {
  return await authComponent.safeGetAuthUser(ctx);
}

/**
 * Require the user to be authenticated.
 * Throws an error if not authenticated.
 * Returns the user's ID.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const user = await getCurrentUser(ctx);
  return user._id;
}
