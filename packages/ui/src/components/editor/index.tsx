import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

import { AutoLinkExtension } from "src/components/editor/extensions/auto-link-extension";
import { DateTimeExtension } from "src/components/editor/extensions/date-time-extension";
import { DragDropPasteExtension } from "src/components/editor/extensions/drag-drop-paste-extension";
import { EmojisExtension } from "src/components/editor/extensions/emojis-extension";
import { ImagesExtension } from "src/components/editor/extensions/images-extension";
import { KeywordsExtension } from "src/components/editor/extensions/keywords-extension";
import { MarkdownShortcutsExtension } from "src/components/editor/extensions/markdown-shortcuts-extension";
import { MaxLengthExtension } from "src/components/editor/extensions/max-length-extension";

import { useDebounce } from "src/components/editor/editor-hooks/use-debounce";

export type UploadFn = (file: File) => Promise<string>;

export type EditorProps = {
  initialContent?: SerializedEditorState;
  onChange?: (state: SerializedEditorState) => void;
  onDebouncedUpdate?: (state: SerializedEditorState) => void;
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

const contentEditable = (
  <div className="relative">
    <ContentEditable className="relative block h-full min-h-80 overflow-auto outline-none" />
    <div className="pointer-events-none absolute left-0 top-0 select-none p-0 text-muted-foreground">
      Start writing...
    </div>
  </div>
);

export function Editor({
  initialContent,
  onChange,
  onDebouncedUpdate,
  editable = true,
  uploadFn: _uploadFn,
  children,
}: EditorProps) {
  const [capturedInitialContent] = useState(() => initialContent);

  const debouncedUpdate = useDebounce(
    (state: SerializedEditorState) => {
      onDebouncedUpdate?.(state);
    },
    2000,
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleChange = useCallback(
    (state: SerializedEditorState) => {
      onChangeRef.current?.(state);
      debouncedUpdate(state);
    },
    [debouncedUpdate],
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
        $initialEditorState: capturedInitialContent
          ? JSON.stringify(capturedInitialContent)
          : null,
        editable,
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
          ImagesExtension,
          KeywordsExtension,
          MarkdownShortcutsExtension,
          MaxLengthExtension,
        ],
      }),
    [],
  );

  return (
    <LexicalExtensionComposer
      extension={extension}
      contentEditable={contentEditable}
    >
      <OnChangePlugin onChange={handleChange} />
      <EditablePlugin editable={editable} />
      {children}
    </LexicalExtensionComposer>
  );
}
