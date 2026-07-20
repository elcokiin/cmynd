type LexicalNode = {
  type?: string;
  children?: LexicalNode[];
  storageId?: string;
  [key: string]: unknown;
};

type SerializedEditorState = {
  root: LexicalNode;
};

export function extractImageKeys(
  content: SerializedEditorState,
): string[] {
  const keys: string[] = [];

  function walk(node: LexicalNode) {
    if (node.type === "image" && node.storageId) {
      keys.push(node.storageId);
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  walk(content.root);
  return keys;
}
