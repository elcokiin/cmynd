import { useEffect, useMemo, useRef, useState } from "react";

import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { configExtension, defineExtension } from "lexical";
import { ReactExtension } from "@lexical/react/ReactExtension";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import type { SerializedEditorState } from "lexical";

import { editorTheme } from "src/components/editor/themes/editor-theme";

import { RichTextExtension } from "@lexical/rich-text";
import { HistoryExtension } from "@lexical/history";
import { ListExtension, CheckListExtension } from "@lexical/list";
import { LinkExtension } from "@lexical/link";
import { CodeExtension } from "@lexical/code";
import { TableExtension } from "@lexical/table";
import { HashtagExtension } from "@lexical/hashtag";
import { OverflowExtension } from "@lexical/overflow";
import { HorizontalRuleExtension } from "@lexical/extension";

import { AutocompleteNode } from "src/components/editor/nodes/autocomplete-node";
import { TweetNode } from "src/components/editor/nodes/embeds/tweet-node";
import { YouTubeNode } from "src/components/editor/nodes/embeds/youtube-node";
import { EmojiNode } from "src/components/editor/nodes/emoji-node";
import { LayoutContainerNode } from "src/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "src/components/editor/nodes/layout-item-node";
import { MentionNode } from "src/components/editor/nodes/mention-node";
import { SpecialTextNode } from "src/components/editor/nodes/special-text-node";

import { AutoLinkExtension } from "src/components/editor/extensions/auto-link-extension";
import { DateTimeExtension } from "src/components/editor/extensions/date-time-extension";
import { DragDropPasteExtension } from "src/components/editor/extensions/drag-drop-paste-extension";
import { EmojisExtension } from "src/components/editor/extensions/emojis-extension";
import { ImagesExtension } from "src/components/editor/extensions/images-extension";
import { KeywordsExtension } from "src/components/editor/extensions/keywords-extension";
import { MarkdownShortcutsExtension } from "src/components/editor/extensions/markdown-shortcuts-extension";
import { MaxLengthExtension } from "src/components/editor/extensions/max-length-extension";

import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import type { Transformer } from "@lexical/markdown";
import { HR } from "src/components/editor/transformers/markdown-hr-transformer";
import { IMAGE } from "src/components/editor/transformers/markdown-image-transformer";

import { EditorToolbar } from "src/components/editor/editor-toolbar";
import { AutoEmbedPlugin } from "src/components/editor/plugins/embeds/auto-embed-plugin";
import { TwitterPlugin } from "src/components/editor/plugins/embeds/twitter-plugin";
import { YouTubePlugin } from "src/components/editor/plugins/embeds/youtube-plugin";
import { EmojiPickerPlugin } from "src/components/editor/plugins/emoji-picker-plugin";
import { FloatingTextFormatToolbarPlugin } from "src/components/editor/plugins/floating-text-format-plugin";
import { FloatingLinkEditorPlugin } from "src/components/editor/plugins/floating-link-editor-plugin";
import { ComponentPickerMenuPlugin } from "src/components/editor/plugins/component-picker-menu-plugin";
import {
  getDefaultComponentPickerOptions,
  getDynamicComponentPickerOptions,
} from "src/components/editor/plugins/picker";

export type UploadFn = (file: File) => Promise<string>;

export type EditorProps = {
  variant?: "minimal" | "medium" | "full";
  initialContent?: SerializedEditorState;
  onChange?: (state: SerializedEditorState) => void;
  editable?: boolean;
  uploadFn?: UploadFn | null;
  children?: React.ReactNode;
};

function OnChangePlugin({
  onChange,
}: {
  onChange?: (state: SerializedEditorState) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChangeRef.current?.(editorState.toJSON());
    });
  }, [editor]);

  return null;
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return null;
}

export function Editor({
  variant = "full",
  initialContent,
  onChange,
  editable = true,
  uploadFn: _uploadFn,
  children,
}: EditorProps) {
  const [capturedInitialContent] = useState(() => initialContent);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const hasContent = capturedInitialContent
    && capturedInitialContent.root
    && capturedInitialContent.root.children
    && capturedInitialContent.root.children.length > 0;
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null);

  const contentEditable = (
    <div className="flex flex-col">
      {variant === "full" && (
        <EditorToolbar setIsLinkEditMode={setIsLinkEditMode} />
      )}
      <div className="relative">
        <ContentEditable
          className="relative block h-full overflow-auto outline-none px-4 py-3"
          aria-placeholder="Press / for commands..."
          placeholder={<span className="text-muted-foreground/50">Press / for commands...</span>}
        />
      </div>
    </div>
  );

  const markdownTransformers: Array<Transformer> = useMemo(
    () => [
      HR,
      IMAGE,
      CHECK_LIST,
      ...ELEMENT_TRANSFORMERS,
      ...MULTILINE_ELEMENT_TRANSFORMERS,
      ...TEXT_FORMAT_TRANSFORMERS,
      ...TEXT_MATCH_TRANSFORMERS,
    ],
    [],
  );

  const extension = useMemo(
    () =>
      defineExtension({
        name: "cmynd-editor",
        theme: editorTheme,
        namespace: "Editor",
        onError: (error: Error) => {
          console.error(error);
        },
        $initialEditorState: hasContent
          ? JSON.stringify(capturedInitialContent)
          : null,
        editable,
        nodes: [
          EmojiNode,
          MentionNode,
          AutocompleteNode,
          SpecialTextNode,
          LayoutContainerNode,
          LayoutItemNode,
          TweetNode,
          YouTubeNode,
        ],
        dependencies: [
          configExtension(ReactExtension, {
            contentEditable,
            ErrorBoundary: LexicalErrorBoundary,
          }),
          RichTextExtension,
          HistoryExtension,
          ListExtension,
          CheckListExtension,
          LinkExtension,
          CodeExtension,
          TableExtension,
          HashtagExtension,
          OverflowExtension,
          AutoLinkExtension,
          DateTimeExtension,
          DragDropPasteExtension,
          EmojisExtension,
          HorizontalRuleExtension,
          ImagesExtension,
          KeywordsExtension,
          configExtension(MarkdownShortcutsExtension, {
            transformers: markdownTransformers,
          }),
          MaxLengthExtension,
        ],
      }),
    [],
  );

  return (
    <div ref={setAnchorElem} className="relative">
      <LexicalExtensionComposer extension={extension}>
        <OnChangePlugin onChange={onChange} />
        <EditablePlugin editable={editable} />
        {variant !== "minimal" && (
          <>
            <FloatingTextFormatToolbarPlugin
              anchorElem={anchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <FloatingLinkEditorPlugin
              anchorElem={anchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <ComponentPickerMenuPlugin
              baseOptions={getDefaultComponentPickerOptions()}
              dynamicOptionsFn={getDynamicComponentPickerOptions}
            />
            <EmojiPickerPlugin />
            <AutoEmbedPlugin />
            <TwitterPlugin />
            <YouTubePlugin />
          </>
        )}
        {children}
      </LexicalExtensionComposer>
    </div>
  );
}
