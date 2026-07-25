import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { chatAgent } from "./agent";

export const createThread = mutation({
  args: {},
  handler: async (ctx) => {
    return await chatAgent.createThread(ctx);
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await chatAgent.saveMessage(ctx, {
      threadId,
      prompt,
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.internal.generateResponse, {
      threadId,
      promptMessageId: messageId,
    });
  },
});

export const resetThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    await chatAgent.deleteThreadAsync(ctx, { threadId });
  },
});
