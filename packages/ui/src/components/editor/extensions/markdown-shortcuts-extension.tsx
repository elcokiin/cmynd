import { effect, namedSignals } from "@lexical/extension";
import {
  $convertFromMarkdownString,
  type Transformer,
  registerMarkdownShortcuts,
} from "@lexical/markdown";
import {
  $getSelection,
  COMMAND_PRIORITY_CRITICAL,
  PASTE_COMMAND,
  defineExtension,
  safeCast,
} from "lexical";

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

          event.preventDefault();

          editor.update(() => {
            const selection = $getSelection();
            if (!selection) return;

            $convertFromMarkdownString(text, transformers);
          });

          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      );

      return () => {
        unregisterShortcuts();
        unregisterPaste();
      };
    }),
});
