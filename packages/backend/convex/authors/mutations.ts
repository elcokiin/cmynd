import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { phraseValidator } from "../../lib/validators/authors";
import { getAuthorById, getOrCreateAuthorForUser } from "./helpers";
import * as Auth from "../_lib/auth";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import { r2 } from "../r2";

/**
 * Create a new author (admin-only).
 * Auto-verified since the creator is an admin.
 */
export const createReprinted = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await Auth.requireAdmin(ctx);

    await ctx.db.insert("authors", {
      name: args.name,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      createdBy: user._id,
      isVerified: true,
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
    const userId = await Auth.requireAuth(ctx);

    const author = await getAuthorById(ctx, args.authorId);

    if (author.userId !== userId) {
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
 * Update the current user's account image (shared with their author profile).
 * Get-or-creates an author profile for the user, then sets the avatar.
 * An empty/absent avatarUrl clears the image (falls back to portfolio).
 */
export const updateAccountAvatar = mutation({
  args: {
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await Auth.getCurrentUser(ctx);

    const authorId = await getOrCreateAuthorForUser(ctx, user._id);
    const author = await getAuthorById(ctx, authorId);

    const hasAvatarArg = args.avatarUrl !== undefined;
    const trimmed = args.avatarUrl?.trim() ?? "";
    const avatarUrl = trimmed || undefined;

    if (avatarUrl) {
      try {
        new URL(avatarUrl);
      } catch {
        throwConvexError(ErrorCode.AUTHOR_INVALID_AVATAR_URL);
      }
    }

    const updates: {
      avatarUrl?: string;
      avatarStorageId?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (hasAvatarArg) {
      updates.avatarUrl = avatarUrl;
      updates.avatarStorageId = avatarUrl ? args.avatarStorageId : undefined;
    }

    await ctx.db.patch(authorId, updates);

    const oldStorageId = author.avatarStorageId;
    const newStorageId = avatarUrl ? args.avatarStorageId : undefined;
    if (oldStorageId && oldStorageId !== newStorageId) {
      await r2.deleteObject(ctx, oldStorageId);
    }
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
    avatarStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"authors">> => {
    const user = await Auth.getCurrentUser(ctx);

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
      avatarStorageId: args.avatarStorageId,
      bio: args.bio,
      createdBy: user._id,
      isVerified: admin,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return authorId;
  },
});

/**
 * Admin approves (verifies) an author.
 */
export const approve = mutation({
  args: {
    authorId: v.id("authors"),
  },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    const author = await getAuthorById(ctx, args.authorId);

    if (author.isVerified) {
      throwConvexError(ErrorCode.AUTHOR_ALREADY_VERIFIED);
    }

    await ctx.db.patch(args.authorId, {
      isVerified: true,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Admin unverifies an author.
 */
export const unverify = mutation({
  args: {
    authorId: v.id("authors"),
  },
  handler: async (ctx, args): Promise<void> => {
    await Auth.requireAdmin(ctx);

    const author = await getAuthorById(ctx, args.authorId);

    if (!author.isVerified) {
      throwConvexError(ErrorCode.AUTHOR_ALREADY_UNVERIFIED);
    }

    await ctx.db.patch(args.authorId, {
      isVerified: false,
      updatedAt: Date.now(),
    });
  },
});
