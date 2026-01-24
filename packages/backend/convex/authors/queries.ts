import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthorById } from "./helpers";
import { toPublicAuthor } from "./projections";
import type { PublicAuthor } from "../../lib/types/authors";
import { paginatedAuthorsValidator } from "../../lib/validators/authors";

/**
 * Get a single author by ID.
 * Returns public author data (no sensitive fields).
 */
export const get = query({
  args: { authorId: v.id("authors") },
  handler: async (ctx, args): Promise<PublicAuthor> => {
    return await getAuthorById(ctx, args.authorId);
  },
});

/**
 * List all authors with pagination.
 * Returns public author data only.
 */
export const list = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: paginatedAuthorsValidator,
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("authors")
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toPublicAuthor),
    };
  },
});
