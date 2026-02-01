# [ ] Remove the "Save document" button on `/editor/new`

## Description
Remove the manual "Save document" button on `/editor/new` to reduce friction.

The document should save automatically when the user changes the title or content.

## Acceptance Criteria
- The "Save document" button is removed from `/editor/new`.
- Title/content changes trigger auto-save (preferably debounced to avoid excessive writes).
- The UI shows save state (saving / saved / error).
- No save occurs if nothing changed.
