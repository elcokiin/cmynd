import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { getAuthorById } from "./helpers";
import { toPublicAuthor, toAdminAuthor } from "./projections";
import type { PublicAuthor, AdminAuthor } from "../../lib/types/authors";
import * as Auth from "../_lib/auth";
import {
  paginatedAuthorsValidator,
  paginatedAdminAuthorsValidator,
} from "../../lib/validators/authors";

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
    paginationOpts: paginationOptsValidator,
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
    paginationOpts: paginationOptsValidator,
    verified: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  returns: paginatedAdminAuthorsValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    let result;

    if (args.search) {
      result = await ctx.db
        .query("authors")
        .withSearchIndex("search_name", (q) => {
          let base = q.search("name", args.search!);
          if (args.verified !== undefined) {
            base = base.eq("isVerified", args.verified);
          }
          return base;
        })
        .paginate(args.paginationOpts);
    } else {
      if (args.verified !== undefined) {
        result = await ctx.db
          .query("authors")
          .withIndex("by_isVerified", (q) =>
            q.eq("isVerified", args.verified),
          )
          .order("desc")
          .paginate(args.paginationOpts);
      } else {
        result = await ctx.db
          .query("authors")
          .order("desc")
          .paginate(args.paginationOpts);
      }
    }

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
 * Get total author count (admin only).
 */
export const getAuthorCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    await Auth.requireAdmin(ctx);

    const authors = await ctx.db.query("authors").collect();
    return authors.length;
  },
});

/**
 * List original author candidates.
 * Returns authors suitable as original authors for reprints:
 * - Verified authors, OR
 * - Unverified authors created by other users (not the current user)
 */
export const listOriginalAuthors = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: paginatedAuthorsValidator,
  handler: async (ctx, args) => {
    const userId = await Auth.requireAuth(ctx);

    const result = await ctx.db
      .query("authors")
      .filter((q) =>
        q.or(
          q.eq(q.field("isVerified"), true),
          q.and(
            q.eq(q.field("userId"), undefined),
            q.eq(q.field("createdBy"), userId),
          ),
        ),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map(toPublicAuthor),
    };
  },
});
