import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../_generated/server";

import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import type { SkillLink } from "../../lib/types/portfolio";

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

// ═════════════════════════════════════════════════════════════════════
// Relationship helpers (projectSkills / experienceSkills)
// ═════════════════════════════════════════════════════════════════════

/**
 * Get all projectSkills rows for a project.
 */
export async function listProjectSkillLinks(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
): Promise<Doc<"projectSkills">[]> {
  return await ctx.db
    .query("projectSkills")
    .withIndex("by_project", (q) => q.eq("projectId", projectId))
    .collect();
}

/**
 * Get all experienceSkills rows for an experience entry.
 */
export async function listExperienceSkillLinks(
  ctx: QueryCtx | MutationCtx,
  experienceId: Id<"experience">,
): Promise<Doc<"experienceSkills">[]> {
  return await ctx.db
    .query("experienceSkills")
    .withIndex("by_experience", (q) => q.eq("experienceId", experienceId))
    .collect();
}

/**
 * Hydrate the skill documents linked to a project (keeps link order).
 */
export async function listSkillsForProject(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
): Promise<Doc<"skills">[]> {
  const links = await listProjectSkillLinks(ctx, projectId);
  const skills = await Promise.all(
    links.map((link) => ctx.db.get("skills", link.skillId)),
  );
  return skills.filter((s): s is Doc<"skills"> => s !== null);
}

/**
 * Hydrate the skill documents linked to an experience entry.
 */
export async function listSkillsForExperience(
  ctx: QueryCtx | MutationCtx,
  experienceId: Id<"experience">,
): Promise<Doc<"skills">[]> {
  const links = await listExperienceSkillLinks(ctx, experienceId);
  const skills = await Promise.all(
    links.map((link) => ctx.db.get("skills", link.skillId)),
  );
  return skills.filter((s): s is Doc<"skills"> => s !== null);
}

/**
 * Get the project IDs that use a given skill.
 */
export async function listProjectIdsForSkill(
  ctx: QueryCtx | MutationCtx,
  skillId: Id<"skills">,
): Promise<Id<"projects">[]> {
  const links = await ctx.db
    .query("projectSkills")
    .withIndex("by_skill", (q) => q.eq("skillId", skillId))
    .collect();
  return links.map((link) => link.projectId);
}

/**
 * Get the experience IDs that use a given skill.
 */
export async function listExperienceIdsForSkill(
  ctx: QueryCtx | MutationCtx,
  skillId: Id<"skills">,
): Promise<Id<"experience">[]> {
  const links = await ctx.db
    .query("experienceSkills")
    .withIndex("by_skill", (q) => q.eq("skillId", skillId))
    .collect();
  return links.map((link) => link.experienceId);
}

/**
 * Diff-based sync of a project's skill links. Removes links that are no
 * longer present and inserts missing ones. Must run inside a mutation.
 */
export async function syncProjectSkills(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  skillLinks: SkillLink[],
) {
  const existing = await listProjectSkillLinks(ctx, projectId);
  const incoming = new Map(
    skillLinks.map((link) => [link.skillId, link.role ?? null]),
  );

  for (const link of existing) {
    const role = incoming.get(link.skillId);
    if (role === undefined) {
      await ctx.db.delete("projectSkills", link._id);
    } else if (link.role !== (role ?? undefined)) {
      await ctx.db.patch("projectSkills", link._id, { role: role ?? undefined });
    }
  }

  const existingIds = new Set(existing.map((link) => link.skillId));
  for (const link of skillLinks) {
    if (!existingIds.has(link.skillId)) {
      await ctx.db.insert("projectSkills", {
        projectId,
        skillId: link.skillId,
        role: link.role,
      });
    }
  }
}

/**
 * Diff-based sync of an experience's skill links. Must run inside a mutation.
 */
export async function syncExperienceSkills(
  ctx: MutationCtx,
  experienceId: Id<"experience">,
  skillIds: Id<"skills">[],
) {
  const existing = await listExperienceSkillLinks(ctx, experienceId);
  const incoming = new Set(skillIds);

  for (const link of existing) {
    if (!incoming.has(link.skillId)) {
      await ctx.db.delete("experienceSkills", link._id);
    }
  }

  const existingIds = new Set(existing.map((link) => link.skillId));
  for (const skillId of skillIds) {
    if (!existingIds.has(skillId)) {
      await ctx.db.insert("experienceSkills", { experienceId, skillId });
    }
  }
}

/**
 * Delete all projectSkills rows referencing a project.
 */
export async function deleteProjectSkillLinks(
  ctx: MutationCtx,
  projectId: Id<"projects">,
) {
  const links = await listProjectSkillLinks(ctx, projectId);
  for (const link of links) {
    await ctx.db.delete("projectSkills", link._id);
  }
}

/**
 * Delete all experienceSkills rows referencing an experience entry.
 */
export async function deleteExperienceSkillLinks(
  ctx: MutationCtx,
  experienceId: Id<"experience">,
) {
  const links = await listExperienceSkillLinks(ctx, experienceId);
  for (const link of links) {
    await ctx.db.delete("experienceSkills", link._id);
  }
}

/**
 * Delete all junction rows that reference a skill.
 */
export async function deleteSkillLinks(
  ctx: MutationCtx,
  skillId: Id<"skills">,
) {
  const projectLinks = await ctx.db
    .query("projectSkills")
    .withIndex("by_skill", (q) => q.eq("skillId", skillId))
    .collect();
  for (const link of projectLinks) {
    await ctx.db.delete("projectSkills", link._id);
  }

  const experienceLinks = await ctx.db
    .query("experienceSkills")
    .withIndex("by_skill", (q) => q.eq("skillId", skillId))
    .collect();
  for (const link of experienceLinks) {
    await ctx.db.delete("experienceSkills", link._id);
  }
}
