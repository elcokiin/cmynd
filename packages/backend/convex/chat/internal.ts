import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";
import { chatAgent } from "./agent";
import { buildSystemPrompt } from "./helpers";

export const generateResponse = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, { threadId, promptMessageId }) => {
    const portfolioData = await ctx.runQuery(api.chat.queries.getPortfolioData);

    const systemPrompt = buildSystemPrompt(portfolioData);

    await chatAgent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        system: systemPrompt,
      },
      { saveStreamDeltas: true },
    );
  },
});
