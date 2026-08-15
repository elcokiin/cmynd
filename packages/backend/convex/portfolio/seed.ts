import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { getPortfolioId } from "./helpers";

/**
 * Seed the portfolio with initial data.
 * Call this once after setting up the portfolio tables.
 */
export const seed = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const portfolioId = await getPortfolioId(ctx, args.userId);

    await ctx.db.patch(portfolioId, {
      name: "Diego Tenjo",
      headline: "Full-Stack Developer",
      about: "",
      philosophy: `I believe in building software that is simple, maintainable, and delightful to use. Always performing DX and UX`,
      socialLinks: [
        {
          platform: "GitHub",
          url: "https://github.com/elcokiin",
          label: "@elcokiin",
          image: "https://cdn.simpleicons.org/github/white",
        },
        {
          platform: "LinkedIn",
          url: "https://www.linkedin.com/in/diego-tenjo/",
          label: "in/diego-tenjo",
          image: "https://cdn.simpleicons.org/linkedin/white",
        },
        {
          platform: "X",
          url: "https://x.com/elcokiin",
          label: "@elcokiin",
          image: "https://cdn.simpleicons.org/x/white",
        },
      ],
      updatedAt: Date.now(),
    });
  },
});
