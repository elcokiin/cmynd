import { mutation } from "../_generated/server";
import * as Auth from "../_lib/auth";
import { getPortfolioId } from "./helpers";

/**
 * Seed the portfolio with initial data.
 * Call this once after setting up the portfolio tables.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await Auth.requireAdmin(ctx);

    const portfolioId = await getPortfolioId(ctx);

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
        },
        {
          platform: "Twitter",
          url: "https://x.com/elcokiin",
          label: "@elcokiin",
        },
      ],
      updatedAt: Date.now(),
    });
  },
});
