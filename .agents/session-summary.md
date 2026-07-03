# Session: Fix Markdown Paste Bug in Editor

## Goal
Fix markdown paste in the Lexical editor so pasted text converts markdown formatting (bold, italic, headers, lists) but inserts at the cursor without replacing or corrupting existing content.

## Problem
`$convertFromMarkdownString(text, transformers)` internally calls `root.clear()`, which wiped all existing editor content on paste. The workaround using save/restore of editor state (`toJSON()` → `parseEditorState()` → `setEditorState()`) produced empty/invalid nodes via `$parseSerializedNode` and caused selection corruption.

## Solution
Replaced the broken `$convertFromMarkdownString` approach with a **custom markdown parser** (`$nodesFromMarkdown`) that creates Lexical nodes directly:
- Block parsing: paragraphs, headings (`#`), blockquotes (`>`), bullet lists (`-`/`*`), ordered lists (`1.`)
- Inline formatting via regex-based parser: `**bold**`, `*italic*`, `` `code` ``, `~~strikethrough~~`
- Single paragraph results → children inserted inline (no extra wrapper)
- Multiple blocks → inserted as separate block nodes
- Plain text without markdown → falls through to Lexical default paste (`return false`)

## Files Changed
- `packages/ui/src/components/editor/extensions/markdown-shortcuts-extension.tsx`: Complete rewrite of paste handler

## Key Decisions
- Custom parser avoids ALL Lexical internal dependencies (`$convertFromMarkdownString`, `$parseSerializedNode`, detached nodes, headless editor)
- `registerMarkdownShortcuts` kept for keyboard shortcuts with transformers
- No nesting of inline formatting (acceptable simplification for paste)

## Next
Test manually in the running app.
