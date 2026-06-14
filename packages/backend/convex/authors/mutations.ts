import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { phraseValidator } from "../../lib/validators/authors";
import { getAuthorById } from "./helpers";
import * as Auth from "../_lib/auth";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";

/**
 * Create a new reprinted author (unverified).
 * Only admins can create reprinted authors.
 */
export const createReprinted = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    await ctx.db.insert("authors", {
      name: args.name,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      isReprinted: true,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update own author profile.
 * Users can only update their own author profile (checked via userId).
 */
export const update = mutation({
  args: {
    authorId: v.id("authors"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    phrases: v.optional(v.array(phraseValidator)),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwConvexError(ErrorCode.UNAUTHENTICATED);
    }

    const author = await getAuthorById(ctx, args.authorId);

    if (author.userId !== identity.subject) {
      throwConvexError(ErrorCode.AUTHOR_OWNERSHIP);
    }

    if (args.avatarUrl) {
      try {
        new URL(args.avatarUrl);
      } catch {
        throwConvexError(ErrorCode.AUTHOR_INVALID_AVATAR_URL);
      }
    }

    const updates: Partial<typeof author> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.phrases !== undefined) updates.phrases = args.phrases;

    await ctx.db.patch(args.authorId, updates);
  },
});

/**
 * Create a new author.
 * If the current user is an admin, the author is auto-verified.
 * If not, the author is created unverified.
 */
export const createAuthor = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"authors">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throwConvexError(ErrorCode.UNAUTHENTICATED);
    }

    if (args.avatarUrl) {
      try {
        new URL(args.avatarUrl);
      } catch {
        throwConvexError(ErrorCode.AUTHOR_INVALID_AVATAR_URL);
      }
    }

    const admin = await Auth.isAdmin(ctx);

    const authorId = await ctx.db.insert("authors", {
      name: args.name,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      userId: identity.subject,
      isReprinted: false,
      isVerified: admin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return authorId;
  },
});

/**
 * Admin approves (verifies) a reprinted author.
 * Makes the author verified so it can be linked to user accounts.
 */
export const approve = mutation({
  args: {
    authorId: v.id("authors"),
  },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    const author = await getAuthorById(ctx, args.authorId);

    if (!author.isReprinted) {
      throwConvexError(ErrorCode.AUTHOR_NOT_REPRINTED);
    }

    if (author.isVerified) {
      throwConvexError(ErrorCode.AUTHOR_ALREADY_VERIFIED);
    }

    await ctx.db.patch(args.authorId, {
      isVerified: true,
      updatedAt: Date.now(),
    });
  },
});