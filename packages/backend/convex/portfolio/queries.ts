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
import type { Id, Doc } from "../_generated/dataModel";
import * as Auth from "../_lib/auth";
import { getCdnUrl } from "../../lib/utils/cdn";
import {
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
// Public queries (view any user's portfolio)
// ═════════════════════════════════════════════════════════════════════

/**
 * Get a user's portfolio profile by userId.
 */
export const getProfileByUserId = query({
  args: { userId: v.string() },
  returns: v.union(publicPortfolioValidator, v.null()),
  handler: async (ctx, args): Promise<PublicPortfolio | null> => {
    const portfolio = await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!portfolio) return null;
    
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
 * List a user's visible skills (via their projects and experience).
 */
export const listUserPublicSkills = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<PublicSkill[]> => {
    // Get user's visible projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    const visibleProjects = projects.filter(p => p.isVisible);
    
    // Get user's experience
    const experience = await ctx.db
      .query("experience")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Collect all skill IDs from projects and experience
    const skillIds = new Set<string>();
    
    for (const project of visibleProjects) {
      const links = await listProjectSkillLinks(ctx, project._id);
      links.forEach(link => skillIds.add(link.skillId));
    }
    
    for (const exp of experience) {
      const links = await ctx.db
        .query("experienceSkills")
        .withIndex("by_experience", (q) => q.eq("experienceId", exp._id))
        .collect();
      links.forEach(link => skillIds.add(link.skillId));
    }
    
    // Fetch and return unique skills
    const skills = await Promise.all(
      Array.from(skillIds).map(id => ctx.db.get("skills", id as Id<"skills">))
    );
    
    return skills
      .filter((s): s is Doc<"skills"> => s !== null)
      .map(toPublicSkill);
  },
});

/**
 * List a user's visible projects ordered by `order`.
 */
export const listUserPublicProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<PublicProject[]> => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    
    const visibleProjects = projects.filter(p => p.isVisible);
    const withImages = await resolveProjects(visibleProjects.map(toPublicProject));
    return hydrateProjectsWithSkills(ctx, withImages);
  },
});

/**
 * Get a single project by its slug for a specific user.
 */
export const getUserProjectBySlug = query({
  args: { userId: v.string(), slug: v.string() },
  returns: v.union(publicProjectValidator, v.null()),
  handler: async (ctx, args): Promise<PublicProject | null> => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_userId_and_slug", (q) => 
        q.eq("userId", args.userId).eq("slug", args.slug)
      )
      .first();
    
    if (!project || !project.isVisible) return null;
    const withImages = await resolveSingleProject(toPublicProject(project));
    const skills = await listSkillsForProject(ctx, project._id);
    return { ...withImages, skills: skills.map(toSkillReference) };
  },
});

/**
 * List a user's experience entries.
 */
export const listUserPublicExperience = query({
  args: {
    userId: v.string(),
    type: v.optional(v.union(v.literal("work"), v.literal("education"), v.literal("certification"))),
  },
  handler: async (ctx, args): Promise<PublicExperience[]> => {
    let experience;

    if (args.type) {
      experience = await ctx.db
        .query("experience")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
      experience = experience.filter(e => e.userId === args.userId);
    } else {
      experience = await ctx.db
        .query("experience")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .order("asc")
        .collect();
    }

    return hydrateExperienceWithSkills(ctx, experience.map(toPublicExperience));
  },
});

// ═════════════════════════════════════════════════════════════════════
// Authenticated queries (edit own portfolio)
// ═════════════════════════════════════════════════════════════════════

/**
 * Get current user's portfolio for editing. Returns null if no portfolio exists yet.
 */
export const getMyPortfolio = query({
  args: {},
  returns: v.union(adminPortfolioValidator, v.null()),
  handler: async (ctx) => {
    const userId = await Auth.requireAuth(ctx);
    const portfolio = await ctx.db
      .query("portfolio")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!portfolio) return null;
    
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
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  },
});

/**
 * Get a single skill with computed evidence (for editing).
 */
export const getSkillWithEvidence = query({
  args: { skillId: v.id("skills") },
  returns: v.union(skillWithEvidenceValidator, v.null()),
  handler: async (ctx, args): Promise<SkillWithEvidence | null> => {
    await Auth.requireAuth(ctx);
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
 * List all skills (for the skill picker). Skills are global.
 */
export const listAllSkills = query({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAuth(ctx);
    const skills = await ctx.db.query("skills").order("asc").collect();
    return skills.map(toAdminSkill);
  },
});

/**
 * List current user's projects (for editing).
 */
export const listMyProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await Auth.requireAuth(ctx);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    const withImages = await resolveProjects(projects.map(toAdminProject));
    return hydrateAdminProjectsWithSkills(ctx, withImages);
  },
});

/**
 * List current user's experience (for editing).
 */
export const listMyExperience = query({
  args: {},
  handler: async (ctx) => {
    const userId = await Auth.requireAuth(ctx);
    const experience = await ctx.db
      .query("experience")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
    return hydrateExperienceWithSkills(ctx, experience.map(toAdminExperience));
  },
});
