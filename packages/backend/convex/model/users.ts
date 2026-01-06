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

/**
 * Check if the current user is an admin.
 * Returns false if not authenticated.
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUserOrNull(ctx);
  // Type assertion needed until Better Auth component schema is updated
  return (user as any)?.role === "admin";
}

/**
 * Require the user to be an admin.
 * Throws an error if not authenticated or not an admin.
 * Returns the user object.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  // Type assertion needed until Better Auth component schema is updated
  if ((user as any).role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}
