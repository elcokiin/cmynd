import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { components } from "../_generated/api";
import { listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { ErrorCode, throwConvexError } from "@elcokiin/errors";
import {
  listSkillsForProject,
  listSkillsForExperience,
} from "../portfolio/helpers";

export const getPortfolioData = query({
  args: {},
  handler: async (ctx) => {
    const portfolio = await ctx.db.query("portfolio").first();
    if (!portfolio) {
      throwConvexError(ErrorCode.PORTFOLIO_NOT_FOUND);
    }

    const skills = await ctx.db
      .query("skills")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .order("asc")
      .collect();

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .order("asc")
      .collect();

    const experience = await ctx.db
      .query("experience")
      .order("asc")
      .collect();

    const projectsWithSkills = await Promise.all(
      projects.map(async (p) => ({
        title: p.title,
        description: p.description,
        skills: (await listSkillsForProject(ctx, p._id)).map((s) => s.name),
      })),
    );

    const experienceWithSkills = await Promise.all(
      experience.map(async (e) => ({
        title: e.title,
        organization: e.organization,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: e.description,
        skills: (await listSkillsForExperience(ctx, e._id)).map((s) => s.name),
      })),
    );

    return {
      profile: {
        name: portfolio.name,
        headline: portfolio.headline,
        philosophy: portfolio.philosophy,
      },
      skills: skills.map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
      })),
      projects: projectsWithSkills,
      experience: experienceWithSkills,
    };
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);

    const streams = await syncStreams(ctx, components.agent, {
      ...args,
      includeStatuses: ["streaming", "aborted", "finished"],
    });

    return {
      ...paginated,
      streams,
    };
  },
});
