import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthorById } from "./helpers";
import { toPublicAuthor, toAdminAuthor } from "./projections";
import type { PublicAuthor, AdminAuthor } from "../../lib/types/authors";
import * as Auth from "../_lib/auth";
import { paginatedAuthorsValidator, paginatedAdminAuthorsValidator } from "../../lib/validators/authors";

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

/**
 * List all authors (admin only).
 * Returns admin author data including userId and verification status.
 */
export const listForAdmin = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    verified: v.optional(v.boolean()),
    onlyReprinted: v.optional(v.boolean()),
  },
  returns: paginatedAdminAuthorsValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    let query = ctx.db.query("authors").order("desc");

    if (args.verified !== undefined) {
      query = query.filter((q) => q.eq(q.field("isVerified"), args.verified));
    }

    if (args.onlyReprinted !== undefined) {
      query = query.filter((q) => q.eq(q.field("isReprinted"), args.onlyReprinted));
    }

    const result = await query.paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toAdminAuthor),
    };
  },
});

/**
 * Get a single author by ID for admin (admin only).
 * Returns admin author data including userId for management.
 */
export const getForAdmin = query({
  args: { authorId: v.id("authors") },
  handler: async (ctx, args): Promise<AdminAuthor> => {
    await Auth.requireAdmin(ctx);

    const author = await getAuthorById(ctx, args.authorId);
    return toAdminAuthor(author);
  },
});

/**
 * List original author candidates (admin only).
 * Returns authors suitable as original authors for reprints:
 * - Authors marked as reprinted, OR
 * - Verified authors not linked to a user account
 */
export const listOriginalAuthors = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
  },
  returns: paginatedAdminAuthorsValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const result = await ctx.db
      .query("authors")
      .filter((q) =>
        q.or(
          q.eq(q.field("isReprinted"), true),
          q.and(
            q.eq(q.field("isVerified"), true),
            q.eq(q.field("userId"), undefined),
          ),
        ),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toAdminAuthor),
    };
  },
});