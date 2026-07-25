import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { env } from "@elcokiin/env/backend";

import {
  upsertSkillArgsValidator,
  createProjectArgsValidator,
  updateProjectArgsValidator,
  createExperienceArgsValidator,
  updateExperienceArgsValidator,
} from "../../lib/validators/portfolio";
import * as Auth from "../_lib/auth";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import { r2 } from "../r2";
import { getCdnUrl } from "../../lib/utils/cdn";
import {
  getPortfolioId,
  getSkillById,
  getProjectById,
  getExperienceById,
  isSlugTaken,
  isSkillNameTaken,
} from "./helpers";

// ═════════════════════════════════════════════════════════════════════
// Portfolio profile mutations
// ═════════════════════════════════════════════════════════════════════

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    headline: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    about: v.optional(v.string()),
    philosophy: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          label: v.optional(v.string()),
        }),
      ),
    ),
    hobbies: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.optional(v.string()),
          emoji: v.optional(v.string()),
        }),
      ),
    ),
    playlist: v.optional(
      v.object({
        spotifyPlaylistId: v.optional(v.string()),
        songs: v.optional(
          v.array(
            v.object({
              title: v.string(),
              artist: v.string(),
              youtubeId: v.optional(v.string()),
            }),
          ),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await Auth.requireAdmin(ctx);

    const portfolioId = await getPortfolioId(ctx);

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.headline !== undefined) updates.headline = args.headline;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.about !== undefined) updates.about = args.about;
    if (args.philosophy !== undefined) updates.philosophy = args.philosophy;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;
    if (args.hobbies !== undefined) updates.hobbies = args.hobbies;
    if (args.playlist !== undefined) updates.playlist = args.playlist;

    const existing = await ctx.db.get(portfolioId);
    if (!existing?.createdBy) {
      updates.createdBy = user._id;
    }

    await ctx.db.patch(portfolioId, updates);
  },
});

// ═════════════════════════════════════════════════════════════════════
// Skill mutations
// ═════════════════════════════════════════════════════════════════════

export const upsertSkill = mutation({
  args: upsertSkillArgsValidator,
  handler: async (ctx, args) => {
    const user = await Auth.requireAdmin(ctx);

    const duplicate = await isSkillNameTaken(ctx, args.name, args.category, args._id);
    if (duplicate) {
      throwConvexError(ErrorCode.SKILL_DUPLICATE_NAME);
    }

    const now = Date.now();

    if (args._id) {
      await getSkillById(ctx, args._id);
      await ctx.db.patch(args._id, {
        name: args.name,
        category: args.category,
        proficiency: args.proficiency,
        isVisible: args.isVisible,
        icon: args.icon,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("skills", {
        name: args.name,
        category: args.category,
        proficiency: args.proficiency,
        isVisible: args.isVisible ?? true,
        icon: args.icon,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const removeSkill = mutation({
  args: { _id: v.id("skills") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);
    await getSkillById(ctx, args._id);
    await ctx.db.delete(args._id);
  },
});

// ═════════════════════════════════════════════════════════════════════
// Project mutations
// ═════════════════════════════════════════════════════════════════════

export const createProject = mutation({
  args: createProjectArgsValidator,
  handler: async (ctx, args) => {
    const user = await Auth.requireAdmin(ctx);

    const slugTaken = await isSlugTaken(ctx, args.slug);
    if (slugTaken) {
      throwConvexError(ErrorCode.PROJECT_SLUG_TAKEN);
    }

    const now = Date.now();
    await ctx.db.insert("projects", {
      title: args.title,
      slug: args.slug,
      description: args.description,
      philosophy: args.philosophy,
      keyKnowledge: args.keyKnowledge,
      keyFeatures: args.keyFeatures,
      url: args.url,
      githubUrl: args.githubUrl,
      technologies: args.technologies,
      images: args.images,
      order: args.order,
      isVisible: args.isVisible ?? true,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProject = mutation({
  args: updateProjectArgsValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    const existing = await getProjectById(ctx, args._id);

    if (args.slug !== undefined && args.slug !== existing.slug) {
      const slugTaken = await isSlugTaken(ctx, args.slug, args._id);
      if (slugTaken) {
        throwConvexError(ErrorCode.PROJECT_SLUG_TAKEN);
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.description !== undefined) updates.description = args.description;
    if (args.philosophy !== undefined) updates.philosophy = args.philosophy;
    if (args.keyKnowledge !== undefined) updates.keyKnowledge = args.keyKnowledge;
    if (args.keyFeatures !== undefined) updates.keyFeatures = args.keyFeatures;
    if (args.url !== undefined) updates.url = args.url;
    if (args.githubUrl !== undefined) updates.githubUrl = args.githubUrl;
    if (args.technologies !== undefined) updates.technologies = args.technologies;
    if (args.images !== undefined) updates.images = args.images;
    if (args.order !== undefined) updates.order = args.order;
    if (args.isVisible !== undefined) updates.isVisible = args.isVisible;

    await ctx.db.patch(args._id, updates);
  },
});

export const removeProject = mutation({
  args: { _id: v.id("projects") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);
    await getProjectById(ctx, args._id);
    await ctx.db.delete(args._id);
  },
});

// ═════════════════════════════════════════════════════════════════════
// Project image mutations
// ═════════════════════════════════════════════════════════════════════

export const uploadProjectImage = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.string(),
    alt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);
    const project = await getProjectById(ctx, args.projectId);

    const url = getCdnUrl(args.storageId, env.R2_PUBLIC_DOMAIN);
    const newImage = { storageId: args.storageId, url, alt: args.alt };
    const images = [...(project.images ?? []), newImage];

    await ctx.db.patch(args.projectId, { images, updatedAt: Date.now() });
  },
});

export const removeProjectImage = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);
    const project = await getProjectById(ctx, args.projectId);

    const images = (project.images ?? []).filter(
      (img) => img.storageId !== args.storageId,
    );

    await r2.deleteObject(ctx, args.storageId);
    await ctx.db.patch(args.projectId, { images, updatedAt: Date.now() });
  },
});

// ═════════════════════════════════════════════════════════════════════
// Experience mutations
// ═════════════════════════════════════════════════════════════════════

export const createExperience = mutation({
  args: createExperienceArgsValidator,
  handler: async (ctx, args) => {
    const user = await Auth.requireAdmin(ctx);

    const now = Date.now();
    await ctx.db.insert("experience", {
      type: args.type,
      title: args.title,
      organization: args.organization,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      isCurrent: args.isCurrent,
      durationHours: args.durationHours,
      credentialId: args.credentialId,
      credentialUrl: args.credentialUrl,
      technologies: args.technologies,
      order: args.order,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateExperience = mutation({
  args: updateExperienceArgsValidator,
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);

    await getExperienceById(ctx, args._id);

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.type !== undefined) updates.type = args.type;
    if (args.title !== undefined) updates.title = args.title;
    if (args.organization !== undefined) updates.organization = args.organization;
    if (args.description !== undefined) updates.description = args.description;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.isCurrent !== undefined) updates.isCurrent = args.isCurrent;
    if (args.durationHours !== undefined) updates.durationHours = args.durationHours;
    if (args.credentialId !== undefined) updates.credentialId = args.credentialId;
    if (args.credentialUrl !== undefined) updates.credentialUrl = args.credentialUrl;
    if (args.technologies !== undefined) updates.technologies = args.technologies;
    if (args.order !== undefined) updates.order = args.order;

    await ctx.db.patch(args._id, updates);
  },
});

export const removeExperience = mutation({
  args: { _id: v.id("experience") },
  handler: async (ctx, args) => {
    await Auth.requireAdmin(ctx);
    await getExperienceById(ctx, args._id);
    await ctx.db.delete(args._id);
  },
});
