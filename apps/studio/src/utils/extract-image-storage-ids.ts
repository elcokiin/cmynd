import type { Id } from "@elcokiin/backend/convex/_generated/dataModel";

type LexicalNode = {
  type?: string;
  children?: LexicalNode[];
  storageId?: string;
  [key: string]: unknown;
};

type SerializedEditorState = {
  root: LexicalNode;
};

export function extractImageStorageIds(
  content: SerializedEditorState,
): Id<"_storage">[] {
  const ids: Id<"_storage">[] = [];

  function walk(node: LexicalNode) {
    if (node.type === "image" && node.storageId) {
      ids.push(node.storageId as Id<"_storage">);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(content.root);
  return ids;
}
