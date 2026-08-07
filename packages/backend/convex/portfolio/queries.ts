import { v } from "convex/values";
import { query, type QueryCtx } from "../_generated/server";
import { env } from "@elcokiin/env/backend";

import {
  publicPortfolioValidator,
  publicProjectValidator,
  adminPortfolioValidator,
  skillWithEvidenceValidator,
} from "../../lib/validators/portfolio";
import type {
  PublicPortfolio,
  PublicSkill,
  PublicProject,
  PublicExperience,
  SkillWithEvidence,
  AdminSkillReference,
  ProjectImage,
  SkillReference,
} from "../../lib/types/portfolio";
import type { Id } from "../_generated/dataModel";
import * as Auth from "../_lib/auth";
import { getCdnUrl } from "../../lib/utils/cdn";
import {
  getPortfolio,
  getProjectBySlug,
  getSkillById,
  listProjectSkillLinks,
  listSkillsForProject,
  listSkillsForExperience,
  listProjectIdsForSkill,
  listExperienceIdsForSkill,
} from "./helpers";
import {
  toPublicSkill,
  toAdminSkill,
  toPublicProject,
  toAdminProject,
  toPublicExperience,
  toAdminExperience,
  toSkillReference,
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

async function hydrateProjectsWithSkills<T extends { _id: Id<"projects"> }>(
  ctx: QueryCtx,
  projects: T[],
): Promise<Array<T & { skills?: SkillReference[] }>> {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      skills: (await listSkillsForProject(ctx, project._id)).map(toSkillReference),
    })),
  );
}

async function hydrateExperienceWithSkills<T extends { _id: Id<"experience"> }>(
  ctx: QueryCtx,
  experience: T[],
): Promise<Array<T & { skills?: SkillReference[] }>> {
  return Promise.all(
    experience.map(async (entry) => ({
      ...entry,
      skills: (await listSkillsForExperience(ctx, entry._id)).map(toSkillReference),
    })),
  );
}

async function hydrateAdminProjectsWithSkills<
  T extends { _id: Id<"projects"> },
>(
  ctx: QueryCtx,
  projects: T[],
): Promise<Array<T & { skills?: AdminSkillReference[] }>> {
  return Promise.all(
    projects.map(async (project) => {
      const links = await listProjectSkillLinks(ctx, project._id);
      const roles = new Map(links.map((link) => [link.skillId, link.role]));
      const skills = await listSkillsForProject(ctx, project._id);
      return {
        ...project,
        skills: skills.map((skill) => ({
          ...toSkillReference(skill),
          role: roles.get(skill._id),
        })),
      };
    }),
  );
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
 * List visible projects ordered by `order`, each with its linked skills.
 */
export const listPublicProjects = query({
  args: {},
  handler: async (ctx): Promise<PublicProject[]> => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .order("asc")
      .collect();

    const withImages = await resolveProjects(projects.map(toPublicProject));
    return hydrateProjectsWithSkills(ctx, withImages);
  },
});

/**
 * Get a single project by its slug, including its linked skills.
 */
export const getProjectBySlugQuery = query({
  args: { slug: v.string() },
  returns: v.union(publicProjectValidator, v.null()),
  handler: async (ctx, args): Promise<PublicProject | null> => {
    const project = await getProjectBySlug(ctx, args.slug);
    if (!project || !project.isVisible) return null;
    const withImages = await resolveSingleProject(toPublicProject(project));
    const [skills] = await Promise.all([
      listSkillsForProject(ctx, project._id),
    ]);
    return { ...withImages, skills: skills.map(toSkillReference) };
  },
});

/**
 * List all experience entries ordered by `order`, each with its linked skills.
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

    return hydrateExperienceWithSkills(ctx, experience.map(toPublicExperience));
  },
});

// ═════════════════════════════════════════════════════════════════════
// Admin queries
// ═════════════════════════════════════════════════════════════════════

/**
 * Get a single skill with computed evidence derived from its real
 * relationships. `yearsSinceFirstUse` is intentionally `null` — queries
 * must not read the wall clock (stale + cache-hostile); compute it on
 * the client from `firstUsedAt`.
 */
export const getSkillWithEvidence = query({
  args: { skillId: v.id("skills") },
  returns: v.union(skillWithEvidenceValidator, v.null()),
  handler: async (ctx, args): Promise<SkillWithEvidence | null> => {
    await Auth.requireAdmin(ctx);
    const skill = await getSkillById(ctx, args.skillId);

    const projectIds = await listProjectIdsForSkill(ctx, args.skillId);
    const experienceIds = await listExperienceIdsForSkill(ctx, args.skillId);

    const projects = (
      await Promise.all(projectIds.map((id) => ctx.db.get("projects", id)))
    ).filter((p) => p !== null);

    const experiences = (
      await Promise.all(experienceIds.map((id) => ctx.db.get("experience", id)))
    ).filter((e) => e !== null);

    const totalHours = experiences.reduce(
      (sum, entry) => sum + (entry.durationHours ?? 0),
      0,
    );

    return {
      ...toAdminSkill(skill),
      evidence: {
        projectsCount: projects.length,
        experiencesCount: experiences.length,
        totalHours,
        yearsSinceFirstUse: null,
      },
    };
  },
});

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
      avatarStorageId: portfolio.avatarStorageId,
      about: portfolio.about,
      philosophy: portfolio.philosophy,
      socialLinks: portfolio.socialLinks,
      hobbies: portfolio.hobbies,
      playlist: portfolio.playlist,
      createdBy: portfolio.createdBy,
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
 * List all projects (admin only), each with its linked skills.
 */
export const listAllProjects = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const projects = await ctx.db.query("projects").order("asc").collect();
    const withImages = await resolveProjects(projects.map(toAdminProject));
    return hydrateAdminProjectsWithSkills(ctx, withImages);
  },
});

/**
 * List all experience (admin only), each with its linked skills.
 */
export const listAllExperience = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);
    const experience = await ctx.db.query("experience").order("asc").collect();
    return hydrateExperienceWithSkills(ctx, experience.map(toAdminExperience));
  },
});
