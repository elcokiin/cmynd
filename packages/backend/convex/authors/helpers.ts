import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

import { ErrorCode, throwConvexError } from "@elcokiin/errors";

/**
 * Get or create an author profile for a Better-Auth user (lazy creation).
 * This is called when a user creates their first document.
 *
 * @param ctx - Mutation context
 * @param userId - Better-Auth user ID
 * @returns Author ID
 */
export async function getOrCreateAuthorForUser(
  ctx: MutationCtx,
  userId: string,
): Promise<Id<"authors">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throwConvexError(ErrorCode.UNAUTHENTICATED);
  }

  const existingAuthor = await ctx.db
    .query("authors")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (existingAuthor) {
    return existingAuthor._id;
  }

  const newAuthorId = await ctx.db.insert("authors", {
    name: identity.name ?? "Anonymous",
    avatarUrl: identity.pictureUrl,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return newAuthorId;
}

/**
 * Get an author by ID with error handling.
 *
 * @param ctx - Query context
 * @param authorId - Author ID
 * @returns Author record
 * @throws AuthorNotFoundError if author not found
 */
export async function getAuthorById(
  ctx: QueryCtx,
  authorId: Id<"authors">,
): Promise<Doc<"authors">> {
  const author = await ctx.db.get("authors", authorId);
  if (!author) {
    throwConvexError(
      ErrorCode.AUTHOR_NOT_FOUND,
      `Author ${authorId} not found`,
    );
  }
  return author;
}
