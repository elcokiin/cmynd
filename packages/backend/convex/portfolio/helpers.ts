import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

import { ErrorCode, throwConvexError } from "@elcokiin/errors";

/**
 * Get the singleton portfolio ID (mutation only).
 * Lazily creates the portfolio row on first access.
 */
export async function getPortfolioId(
  ctx: MutationCtx,
): Promise<Id<"portfolio">> {
  const existing = await ctx.db.query("portfolio").collect();
  if (existing.length > 0) {
    return existing[0]!._id;
  }

  const id = await ctx.db.insert("portfolio", {
    name: "",
    headline: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return id;
}

/**
 * Get the portfolio document. Throws if not found.
 */
export async function getPortfolio(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"portfolio">> {
  const existing = await ctx.db.query("portfolio").collect();
  if (existing.length === 0) {
    throwConvexError(ErrorCode.PORTFOLIO_NOT_FOUND);
  }
  return existing[0]!;
}

/**
 * Get a skill by ID. Throws if not found.
 */
export async function getSkillById(
  ctx: QueryCtx | MutationCtx,
  skillId: Id<"skills">,
) {
  const skill = await ctx.db.get("skills", skillId);
  if (!skill) {
    throwConvexError(ErrorCode.SKILL_NOT_FOUND);
  }
  return skill;
}

/**
 * Get a project by ID. Throws if not found.
 */
export async function getProjectById(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get("projects", projectId);
  if (!project) {
    throwConvexError(ErrorCode.PROJECT_NOT_FOUND);
  }
  return project;
}

/**
 * Get a project by slug. Returns null if not found.
 */
export async function getProjectBySlug(
  ctx: QueryCtx,
  slug: string,
) {
  return await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

/**
 * Check if a project slug is already taken by another project.
 */
export async function isSlugTaken(
  ctx: QueryCtx | MutationCtx,
  slug: string,
  excludeId?: Id<"projects">,
) {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

/**
 * Check if a skill name is already taken within the same category.
 */
export async function isSkillNameTaken(
  ctx: QueryCtx | MutationCtx,
  name: string,
  category: string,
  excludeId?: Id<"skills">,
) {
  const existing = await ctx.db
    .query("skills")
    .withIndex("by_category_and_name", (q) =>
      q.eq("category", category).eq("name", name),
    )
    .first();

  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

/**
 * Get an experience entry by ID. Throws if not found.
 */
export async function getExperienceById(
  ctx: QueryCtx | MutationCtx,
  experienceId: Id<"experience">,
) {
  const experience = await ctx.db.get("experience", experienceId);
  if (!experience) {
    throwConvexError(ErrorCode.EXPERIENCE_NOT_FOUND);
  }
  return experience;
}
