import { query } from "../_generated/server";
import type { DocumentType } from "../../lib/types/documents";
import * as Auth from "../_lib/auth";
import { getLocalDay } from "./helpers";

export type WritingActivityDay = {
  date: string;
  words: number;
  publishedWithType?: { type: DocumentType; documentId: string }[];
};

/**
 * Number of years of historical activity returned, mirroring the GitHub-style
 * "one year per row" heatmap.
 */
const MAX_YEARS = 5;

/**
 * Get the authenticated author's daily writing activity for the heatmap.
 *
 * Returns one entry per day with the words written that day and any documents
 * published that day (with their type: own / reprint / inspiration).
 *
 * @throws UnauthenticatedError if not authenticated.
 */
export const getActivity = query({
  args: {},
  handler: async (ctx): Promise<WritingActivityDay[]> => {
    const userId = await Auth.requireAuth(ctx);

    const author = await ctx.db
      .query("authors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!author) {
      return [];
    }

    const cutoff = getLocalDay(Date.now() - MAX_YEARS * 365 * 24 * 60 * 60 * 1000);

    const rows = await ctx.db
      .query("writingActivity")
      .withIndex("by_author_date", (q) => q.eq("authorId", author._id))
      .order("desc")
      .filter((q) => q.gte(q.field("date"), cutoff))
      .collect();

    return rows.map((row) => ({
      date: row.date,
      words: row.words,
      publishedWithType: row.publishedWithType,
    }));
  },
});