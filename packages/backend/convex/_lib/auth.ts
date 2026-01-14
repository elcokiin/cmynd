import type { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { env } from "@elcokiin/env/backend";
import {
  UnauthenticatedError,
  AdminRequiredError,
} from "@elcokiin/errors/backend";

/**
 * Get the current authenticated user.
 * Throws an error if the user is not authenticated.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new UnauthenticatedError();
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
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const user = await getCurrentUser(ctx);
  return user._id;
}

/**
 * Check if the current user is an admin.
 * Checks if the user's email is in the ADMIN_EMAILS environment variable.
 * Returns false if not authenticated or email not in admin list.
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUserOrNull(ctx);
  if (!user?.email) return false;

  const adminEmails = env.ADMIN_EMAILS;
  return adminEmails.includes(user.email.toLowerCase());
}

/**
 * Require the user to be an admin.
 * Checks if the user's email is in the ADMIN_EMAILS environment variable.
 * Throws an error if not authenticated or not an admin.
 * Returns the user object.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);

  const adminEmails = env.ADMIN_EMAILS;
  const userEmail = user.email?.toLowerCase();

  if (!userEmail || !adminEmails.includes(userEmail)) {
    throw new AdminRequiredError();
  }

  return user;
}
