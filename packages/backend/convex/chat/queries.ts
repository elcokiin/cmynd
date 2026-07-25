import { v } from "convex/values";
import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { components } from "../_generated/api";
import { listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";

export const getPortfolioData = query({
  args: {},
  handler: async (ctx) => {
    const portfolio = await ctx.db.query("portfolio").first();
    if (!portfolio) throw new Error("Portfolio not found");

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

    return {
      profile: {
        name: portfolio.name,
        headline: portfolio.headline,
        philosophy: portfolio.philosophy,
      },
      skills: skills.map((s) => ({
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
      })),
      projects: projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies,
      })),
      experience: experience.map((e) => ({
        title: e.title,
        organization: e.organization,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: e.description,
      })),
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
