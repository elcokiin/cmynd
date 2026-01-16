import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthorById } from "./helpers";
import type { PublicAuthor } from "../../lib/types/authors";
import type { Doc } from "../_generated/dataModel";

/**
 * Convert a full author record to public author data.
 */
function toPublicAuthor(author: Doc<"authors">): PublicAuthor {
  return {
    _id: author._id,
    name: author.name,
    avatarUrl: author.avatarUrl,
    bio: author.bio,
    phrases: author.phrases,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  };
}

/**
 * Get a single author by ID.
 * Returns public author data (no sensitive fields).
 */
export const get = query({
  args: { authorId: v.id("authors") },
  handler: async (ctx, args): Promise<PublicAuthor> => {
    const author = await getAuthorById(ctx, args.authorId);
    return toPublicAuthor(author);
  },
});

/**
 * List all authors with pagination.
 * Returns public author data only.
 */
export const list = query({
  args: { paginationOpts: v.object({ numItems: v.number(), cursor: v.union(v.string(), v.null()) }) },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("authors")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: results.page.map(toPublicAuthor),
    };
  },
});
