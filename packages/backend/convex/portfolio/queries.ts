import { v } from "convex/values";
import { query } from "../_generated/server";
import { env } from "@elcokiin/env/backend";

import {
  publicPortfolioValidator,
  publicProjectValidator,
  adminPortfolioValidator,
} from "../../lib/validators/portfolio";
import type {
  PublicPortfolio,
  PublicSkill,
  PublicProject,
  PublicExperience,
  ProjectImage,
} from "../../lib/types/portfolio";
import * as Auth from "../_lib/auth";
import { getCdnUrl } from "../../lib/utils/cdn";
import {
  getPortfolio,
  getProjectBySlug,
} from "./helpers";
import {
  toPublicSkill,
  toAdminSkill,
  toPublicProject,
  toAdminProject,
  toPublicExperience,
  toAdminExperience,
} from "./projections";

async function resolveProjectImages(
  images: ProjectImage[] | undefined,
): Promise<ProjectImage[] | undefined> {
  if (!images) return undefined;
  return images.map((img) => {
    if (img.storageId) {
      const url = getCdnUrl(img.storageId, env.R2_PUBLIC_DOMAIN);
      return { ...img, url };
    }
    return img;
  });
}

async function resolveProjects<T extends { images?: ProjectImage[] }>(
  projects: T[],
): Promise<T[]> {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      images: await resolveProjectImages(project.images),
    })),
  );
}

async function resolveSingleProject<T extends { images?: ProjectImage[] }>(
  project: T,
): Promise<T> {
  return {
    ...project,
    images: await resolveProjectImages(project.images),
  };
}

// ═════════════════════════════════════════════════════════════════════
// Public queries
// ═════════════════════════════════════════════════════════════════════

/**
 * Get the full portfolio profile.
 */
export const getProfile = query({
  args: {},
  returns: publicPortfolioValidator,
  handler: async (ctx): Promise<PublicPortfolio> => {
    const portfolio = await getPortfolio(ctx);
    return {
      _id: portfolio._id,
      name: portfolio.name,
      headline: portfolio.headline,
      avatarUrl: portfolio.avatarUrl,
      about: portfolio.about,
      philosophy: portfolio.philosophy,
      socialLinks: portfolio.socialLinks,
      hobbies: portfolio.hobbies,
      playlist: portfolio.playlist,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  },
});

/**
 * List visible skills, optionally filtered by category.
 */
export const listPublicSkills = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PublicSkill[]> => {
    const category = args.category;

    let query;

    if (category) {
      query = ctx.db
        .query("skills")
        .withIndex("by_category_visible", (q) =>
          q.eq("category", category).eq("isVisible", true),
        );
    } else {
      query = ctx.db
        .query("skills")
        .withIndex("by_visible", (q) => q.eq("isVisible", true));
    }

    const skills = await query.order("asc").collect();
    return skills.map(toPublicSkill);
  },
});

/**
 * List all skill categories (derived from visible skills).
 */
export const listCategories = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect();

    const categories = new Set(skills.map((s) => s.category));
    return Array.from(categories).sort();
  },
});

/**
 * List visible projects ordered by `order`.
 */
export const listPublicProjects = query({
  args: {},
  handler: async (ctx): Promise<PublicProject[]> => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .order("asc")
      .collect();

    return resolveProjects(projects.map(toPublicProject));
  },
});

/**
 * Get a single project by its slug.
 */
export const getProjectBySlugQuery = query({
  args: { slug: v.string() },
  returns: v.union(publicProjectValidator, v.null()),
  handler: async (ctx, args): Promise<PublicProject | null> => {
    const project = await getProjectBySlug(ctx, args.slug);
    if (!project || !project.isVisible) return null;
    return resolveSingleProject(toPublicProject(project));
  },
});

/**
 * List all experience entries ordered by `order`.
 */
export const listPublicExperience = query({
  args: {
    type: v.optional(v.union(v.literal("work"), v.literal("education"), v.literal("certification"))),
  },
  handler: async (ctx, args): Promise<PublicExperience[]> => {
    let experience;

    if (args.type) {
      experience = await ctx.db
        .query("experience")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    } else {
      experience = await ctx.db
        .query("experience")
        .order("asc")
        .collect();
    }

    return experience.map(toPublicExperience);
  },
});

// ═════════════════════════════════════════════════════════════════════
// Admin queries
// ═════════════════════════════════════════════════════════════════════

/**
 * Get portfolio for editing (admin only). Returns null if no portfolio exists yet.
 */
export const getPortfolioForEdit = query({
  args: {},
  returns: v.union(adminPortfolioValidator, v.null()),
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const existing = await ctx.db.query("portfolio").collect();
    if (existing.length === 0) return null;
    const portfolio = existing[0]!;
    return {
      _id: portfolio._id,
      name: portfolio.name,
      headline: portfolio.headline,
      avatarUrl: portfolio.avatarUrl,
      about: portfolio.about,
      philosophy: portfolio.philosophy,
      socialLinks: portfolio.socialLinks,
      hobbies: portfolio.hobbies,
      playlist: portfolio.playlist,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  },
});

/**
 * List all skills (admin only).
 */
export const listAllSkills = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const skills = await ctx.db.query("skills").order("asc").collect();
    return skills.map(toAdminSkill);
  },
});

/**
 * List all projects (admin only).
 */
export const listAllProjects = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const projects = await ctx.db.query("projects").order("asc").collect();
    return resolveProjects(projects.map(toAdminProject));
  },
});

/**
 * List all experience (admin only).
 */
export const listAllExperience = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const experience = await ctx.db.query("experience").order("asc").collect();
    return experience.map(toAdminExperience);
  },
});
