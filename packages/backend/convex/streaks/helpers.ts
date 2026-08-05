import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { DocumentType } from "../../lib/types/documents";

/**
 * Return the local server date as "YYYY-MM-DD".
 * The same day-stamp is used when recording and reading activity, so cell
 * dates match what the author sees locally.
 */
export function getLocalDay(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Recursively collect text from a Lexical `SerializedEditorState`
 * (`root.children`) and compatible TipTap-style trees (`content`).
 * Only `.text` leaves are treated as words; structural keys are ignored.
 */
function collectText(value: unknown, parts: string[]): void {
  if (value === null || value === undefined) return;

  if (typeof value === "string") {
    parts.push(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectText(item, parts);
    return;
  }

  if (typeof value === "object") {
    const node = value as Record<string, unknown>;
    if (typeof node.text === "string") parts.push(node.text);
    collectText(node.content, parts);
    collectText(node.children, parts);
    collectText(node.root, parts);
  }
}

/**
 * Count the number of words in editor JSON content.
 * Returns 0 for null/empty content.
 */
export function countWords(content: unknown): number {
  if (content === null || content === undefined) return 0;
  const parts: string[] = [];
  collectText(content, parts);
  return parts
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

type UpsertActivity =
  | { words: number }
  | { publishType: DocumentType; documentId: Id<"documents"> };

/**
 * Insert-or-increment the writing activity row for an author on the current day.
 * - `words`: accumulates the number of words typed that day.
 * - `publishType`: appends the published document to that day's type list.
 */
export async function upsertActivity(
  ctx: MutationCtx,
  authorId: Id<"authors">,
  update: UpsertActivity,
): Promise<void> {
  const date = getLocalDay();

  const existing = await ctx.db
    .query("writingActivity")
    .withIndex("by_author_date", (q) =>
      q.eq("authorId", authorId).eq("date", date),
    )
    .unique();

  if (!existing) {
    await ctx.db.insert("writingActivity", {
      authorId,
      date,
      words: "words" in update ? update.words : 0,
      publishedWithType:
        "publishType" in update
          ? [{ type: update.publishType, documentId: update.documentId }]
          : undefined,
    });
    return;
  }

  const updates: Record<string, unknown> = {};

  if ("words" in update) {
    updates.words = existing.words + update.words;
  }

  if ("publishType" in update) {
    const current = existing.publishedWithType ?? [];
    if (!current.some((entry) => entry.documentId === update.documentId)) {
      updates.publishedWithType = [
        ...current,
        { type: update.publishType, documentId: update.documentId },
      ];
    }
  }

  await ctx.db.patch(existing._id, updates);
}