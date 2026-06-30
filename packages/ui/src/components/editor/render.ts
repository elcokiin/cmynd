import { createEditor, type Klass, type LexicalNode, type SerializedEditorState } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { OverflowNode } from "@lexical/overflow";
import { HashtagNode } from "@lexical/hashtag";

import { AutocompleteNode } from "./nodes/autocomplete-node";
import { LayoutContainerNode } from "./nodes/layout-container-node";
import { LayoutItemNode } from "./nodes/layout-item-node";
import { MentionNode } from "./nodes/mention-node";
import { SpecialTextNode } from "./nodes/special-text-node";
import { TweetNode } from "./nodes/embeds/tweet-node";
import { YouTubeNode } from "./nodes/embeds/youtube-node";

const defaultNodes: Klass<LexicalNode>[] = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  OverflowNode,
  HashtagNode,
  AutocompleteNode,
  LayoutContainerNode,
  LayoutItemNode,
  MentionNode,
  SpecialTextNode,
  TweetNode,
  YouTubeNode,
];

export function renderToHtml(
  editorState: SerializedEditorState,
  nodes?: Klass<LexicalNode>[],
): string {
  const editor = createEditor({
    nodes: nodes ?? defaultNodes,
    onError: () => {},
  });

  const state = editor.parseEditorState(editorState);
  editor.setEditorState(state);

  let html = "";
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor, null);
  });

  return html;
}
