import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";
import type { CreateGuestAuthorInput } from "../../lib/types/authors";
import { DocumentNotFoundError } from "@elcokiin/errors/backend";

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
  userId: string
): Promise<Id<"authors">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
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
 * @throws DocumentNotFoundError if author not found
 */
export async function getAuthorById(
  ctx: QueryCtx,
  authorId: Id<"authors">
): Promise<Doc<"authors">> {
  const author = await ctx.db.get(authorId);
  if (!author) {
    throw new DocumentNotFoundError("Author not found");
  }
  return author;
}

/**
 * Create a guest author (without user account).
 * 
 * @param ctx - Mutation context
 * @param input - Guest author data
 * @returns New author ID
 */
export async function createGuestAuthor(
  ctx: MutationCtx,
  input: CreateGuestAuthorInput
): Promise<Id<"authors">> {
  if (input.avatarUrl) {
    try {
      new URL(input.avatarUrl);
    } catch {
      throw new Error("Invalid avatar URL format");
    }
  }

  const authorId = await ctx.db.insert("authors", {
    name: input.name,
    avatarUrl: input.avatarUrl,
    bio: input.bio,
    phrases: input.phrases,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return authorId;
}
