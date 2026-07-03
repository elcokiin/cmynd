import { effect, namedSignals } from "@lexical/extension";
import {
  $createListItemNode,
  $createListNode,
} from "@lexical/list";
import {
  type Transformer,
  registerMarkdownShortcuts,
} from "@lexical/markdown";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  $splitNode,
  COMMAND_PRIORITY_LOW,
  type ElementNode,
  type LexicalNode,
  PASTE_COMMAND,
  type TextNode,
  defineExtension,
  safeCast,
} from "lexical";

type FormatSegment = {
  text: string;
  format: number;
};

const FORMAT_PATTERNS: { regex: RegExp; format: number }[] = [
  { regex: /\*\*\*(.+?)\*\*\*/g, format: 3 },
  { regex: /\*\*(.+?)\*\*/g, format: 1 },
  { regex: /__(.+?)__/g, format: 1 },
  { regex: /\*(.+?)\*/g, format: 2 },
  { regex: /_(.+?)_/g, format: 2 },
  { regex: /~~(.+?)~~/g, format: 4 },
  { regex: /`(.+?)`/g, format: 64 },
];

function parseInline(text: string): FormatSegment[] {
  const segments: FormatSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIndex = remaining.length;
    let bestMatch: RegExpExecArray | null = null;
    let bestFormat = 0;

    for (const { regex, format } of FORMAT_PATTERNS) {
      regex.lastIndex = 0;
      const match = regex.exec(remaining);
      if (match && match.index < earliestIndex) {
        earliestIndex = match.index;
        bestMatch = match;
        bestFormat = format;
      }
    }

    if (bestMatch && bestMatch[1]) {
      if (bestMatch.index > 0) {
        segments.push({
          text: remaining.slice(0, bestMatch.index),
          format: 0,
        });
      }
      segments.push({ text: bestMatch[1], format: bestFormat });
      remaining = remaining.slice(bestMatch.index + bestMatch[0].length);
    } else {
      segments.push({ text: remaining, format: 0 });
      break;
    }
  }

  return segments;
}

function $createTextNodes(segments: FormatSegment[]): TextNode[] {
  return segments
    .filter((s) => s.text.length > 0)
    .map(({ text, format }) => {
      const node = $createTextNode(text);
      if (format !== 0) node.setFormat(format);
      return node;
    });
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const LIST_ITEM_RE = /^[-*]\s+(.+)$/;
const ORDERED_LIST_RE = /^\d+\.\s+(.+)$/;

function $nodesFromMarkdown(text: string): LexicalNode[] {
  const nodes: LexicalNode[] = [];
  const lines = text.split("\n");

  const blocks: string[][] = [[]];
  for (const line of lines) {
    if (line.trim() === "") {
      const last = blocks[blocks.length - 1]!;
      if (last.length > 0) blocks.push([]);
    } else {
      blocks[blocks.length - 1]!.push(line);
    }
  }
  if (blocks.length > 0 && blocks[blocks.length - 1]!.length === 0) blocks.pop();

  for (const block of blocks) {
    if (block.length === 0) continue;
    const firstLine: string = block[0]!;

    const headingMatch = firstLine.match(HEADING_RE);
    if (headingMatch) {
      const level = headingMatch[1]!.length as 1 | 2 | 3 | 4 | 5 | 6;
      const heading = $createHeadingNode(`h${level}`);
      const segments = parseInline(headingMatch[2]!);
      for (const node of $createTextNodes(segments)) heading.append(node);
      for (let i = 1; i < block.length; i++) {
        const segs = parseInline(block[i]!);
        for (const node of $createTextNodes(segs)) heading.append(node);
      }
      nodes.push(heading);
      continue;
    }

    const quoteMatch = firstLine.match(BLOCKQUOTE_RE);
    if (quoteMatch) {
      const quote = $createQuoteNode();
      const segs = parseInline(quoteMatch[1]!);
      for (const node of $createTextNodes(segs)) quote.append(node);
      for (let i = 1; i < block.length; i++) {
        const lineQuoteMatch = block[i]!.match(BLOCKQUOTE_RE);
        const text: string = lineQuoteMatch ? lineQuoteMatch[1]! : block[i]!;
        const lineSegs = parseInline(text);
        const br = $createTextNode("\n");
        quote.append(br);
        for (const node of $createTextNodes(lineSegs)) quote.append(node);
      }
      nodes.push(quote);
      continue;
    }

    const listItemMatch = firstLine.match(LIST_ITEM_RE);
    if (listItemMatch) {
      const list = $createListNode("bullet");
      for (const line of block) {
        const m = line.match(LIST_ITEM_RE);
        if (!m) {
          const lastChild = list.getLastChild() as ElementNode | null;
          if (lastChild) {
            const p = $createParagraphNode();
            const segs = parseInline(line);
            for (const node of $createTextNodes(segs)) p.append(node);
            lastChild.append(p);
          }
          continue;
        }
        const item = $createListItemNode();
        const segs = parseInline(m[1]!);
        for (const node of $createTextNodes(segs)) item.append(node);
        list.append(item);
      }
      nodes.push(list);
      continue;
    }

    const orderedItemMatch = firstLine.match(ORDERED_LIST_RE);
    if (orderedItemMatch) {
      const list = $createListNode("number");
      for (const line of block) {
        const m = line.match(ORDERED_LIST_RE);
        if (!m) {
          const lastChild = list.getLastChild() as ElementNode | null;
          if (lastChild) {
            const p = $createParagraphNode();
            const segs = parseInline(line);
            for (const node of $createTextNodes(segs)) p.append(node);
            lastChild.append(p);
          }
          continue;
        }
        const item = $createListItemNode();
        const segs = parseInline(m[1]!);
        for (const node of $createTextNodes(segs)) item.append(node);
        list.append(item);
      }
      nodes.push(list);
      continue;
    }

    const para = $createParagraphNode();
    for (let i = 0; i < block.length; i++) {
      if (i > 0) para.append($createTextNode("\n"));
      const segs = parseInline(block[i]!);
      for (const node of $createTextNodes(segs)) para.append(node);
    }
    nodes.push(para);
  }

  return nodes;
}

export const MarkdownShortcutsExtension = defineExtension({
  build: (_, config) => namedSignals(config),
  config: safeCast<{ transformers: Array<Transformer> }>({ transformers: [] }),
  name: "@shadcn-editor/MarkdownShortcuts",
  register: (editor, _, state) =>
    effect(() => {
      const transformers = state.getOutput().transformers.value;
      const unregisterShortcuts =
        registerMarkdownShortcuts(editor, transformers);

      const unregisterPaste = editor.registerCommand<ClipboardEvent>(
        PASTE_COMMAND,
        (event) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) return false;

          const text = clipboardData.getData("text/plain");
          if (!text || text.trim() === "") return false;

          const hasLineBreak = text.includes("\n");
          const hasMarkdownSyntax = /[*_~`#>\-\[\]()]/.test(text);

          if (!hasLineBreak && !hasMarkdownSyntax) {
            return false;
          }

          event.preventDefault();

          editor.update(() => {
            try {
              const selection = $getSelection();
              if (!$isRangeSelection(selection)) return;

              if (!selection.isCollapsed()) {
                selection.removeText();
              }

              const nodes = $nodesFromMarkdown(text);
              if (nodes.length === 0) return;

              const anchor = selection.anchor;
              const anchorNode = anchor.getNode();
              const currentBlock =
                anchorNode.getTopLevelElementOrThrow();
              const offset = anchor.offset;

              const isSingleInline =
                nodes.length === 1 &&
                nodes[0]!.getType() === "paragraph";

              if (isSingleInline) {
                selection.insertNodes(
                  (nodes[0] as ElementNode).getChildren(),
                );
                return;
              }

              let splitChildIndex: number | null = null;

              if (anchor.type === "text" && $isTextNode(anchorNode)) {
                const textLen = anchorNode.getTextContent().length;
                if (offset > 0 && offset < textLen) {
                  anchorNode.splitText(offset);
                  splitChildIndex =
                    anchorNode.getIndexWithinParent() + 1;
                } else if (offset === 0) {
                  splitChildIndex =
                    anchorNode.getIndexWithinParent();
                }
              } else if ($isElementNode(anchorNode)) {
                const childCount = anchorNode.getChildrenSize();
                if (offset > 0 && offset < childCount) {
                  splitChildIndex = offset;
                } else if (offset === 0) {
                  splitChildIndex = 0;
                }
              }

              if (splitChildIndex !== null) {
                const [, rightTree] = $splitNode(
                  currentBlock,
                  splitChildIndex,
                );

                let lastInserted: LexicalNode = currentBlock;
                for (const node of nodes) {
                  lastInserted = lastInserted.insertAfter(node);
                }

                lastInserted.insertAfter(rightTree);

                const lastBlock = nodes[nodes.length - 1]!;
                if ($isElementNode(lastBlock)) {
                  lastBlock.selectEnd();
                } else {
                  lastBlock.selectEnd();
                }
              } else {
                let lastInserted: LexicalNode = currentBlock;
                for (const node of nodes) {
                  lastInserted = lastInserted.insertAfter(node);
                }

                const lastBlock = nodes[nodes.length - 1]!;
                if ($isElementNode(lastBlock)) {
                  lastBlock.selectEnd();
                } else {
                  lastBlock.selectEnd();
                }
              }
            } catch (error) {
              console.error("[MarkdownPaste] Error:", error);
            }
          });

          return true;
        },
        COMMAND_PRIORITY_LOW,
      );

      return () => {
        unregisterShortcuts();
        unregisterPaste();
      };
    }),
});
