# [ ] Apply code review fixes

## Description
Apply the fixes requested by the code reviewer across the Studio app, UI package, and Convex backend.

These changes are primarily correctness and quality fixes (null guards, effect usage, routing correctness, auth/plugin consistency, and Convex API correctness).

## Tasks

### Studio
- `apps/studio/src/components/admin/document-preview.tsx`
  - Guard against `document === null` (not just `undefined`).
  - Only access `document.type` / compute `documentTypeConfig[document.type]` / `Icon` after confirming `document` is non-null.
  - Render a safe "Document not found" UI when `document` is null.

- `apps/studio/src/components/editor/advanced-editor.tsx`
  - Update the `useDebouncedCallback` handler (`debouncedUpdate`) to `await onDebouncedUpdate?.(content)`.
  - Use `try/catch` to set `setSaveStatus("saved")` on success and `setSaveStatus("error")` on failure (optional `console.error`).

- `apps/studio/src/components/editor/document-settings-dialog.tsx`
  - Fix stale local state: add a `useEffect` that calls `setType(currentType)` when `[currentType, open]` changes.

- `apps/studio/src/components/editor/editable-document-title.tsx`
  - On Escape, cancel any pending debounced save before reverting state (e.g. `debouncedSave.cancel()` or clear timeout).

- `apps/studio/src/components/error-boundary.tsx`
  - Fix logging: remove `statusCode`/`context` from `console.error` payload unless `parseError` actually returns them.
  - Log only real fields (e.g. `parsed.message`, `parsed.code`, and `errorInfo.componentStack`).

- `apps/studio/src/components/user-menu.tsx`
  - Fix the invalid return type annotation (`React.ReactNode` without importing React).
  - Prefer removing the explicit return type or switching it to `JSX.Element | null`.

- `apps/studio/src/hooks/use-manual-pagination.ts`
  - Replace the `useMemo` side-effect with a `useEffect` that updates `cursorMap` via `setCursorMap(prev => new Map(prev)...)`.
  - Update imports to use `useEffect` (and remove `useMemo` if no longer needed).

- `apps/studio/src/hooks/use-url-synced-pagination.ts`
  - Preserve existing URL search params when updating `page` (merge params instead of replacing them).
  - Remove the `isInitialMount` guard and sync pagination when `urlPage` changes (back/forward), while avoiding infinite loops by only calling `pagination.goToPage(urlPage)` when values differ.

- `apps/studio/src/lib/auth-client.ts`
  - Fix plugin mismatch between `adminClient()` and server `betterAuth()` configuration:
    - Either add `admin()` on the server plugins array, OR remove `adminClient()` from the client.

- `apps/studio/src/routes/_auth/editor/new.tsx`
  - Fix redirect after creation: navigate to the protected editor route (e.g. `"/_auth/editor/$slug"`).

- `apps/studio/src/routes/_auth/index.tsx`
  - Fix protected routing targets:
    - Admin link: `"/_auth/admin/dashboard"`
    - Document open navigate: `"/_auth/editor/$slug"`

### Convex Backend
- `packages/backend/convex/authors/helpers.ts`
  - Fix `ctx.db.get` usage in `getAuthorById`: use `ctx.db.get(authorId)` (no table name argument).

- `packages/backend/convex/authors/queries.ts`
  - Ensure `get` returns `PublicAuthor`: call `toPublicAuthor` on the result of `getAuthorById`.

- `packages/backend/convex/documents/mutations.ts`
  - In `publish`, block publishing when the document is pending review (e.g. `status === "pending"` / `"pending_review"`).
  - Throw via `throwConvexError` before validations and before `ctx.db.patch`.

- `packages/backend/convex/storage.ts`
  - Enforce access control before returning `ctx.storage.getUrl(args.storageId)`.
  - Only allow authenticated and authorized access (owner/public rules), otherwise return null or throw.

### Packages
- `packages/backend/package.json`
  - Fix `@types/slug` mismatch with `slug@11` (ESM): remove/replace `@types/slug` and align imports/types; verify TypeScript passes.

- `packages/ui/src/components/dialog.tsx`
  - Add `"use client"` as the first line (Base UI primitives are client-only).

- `packages/ui/src/components/theme-toggle.tsx`
  - Add `"use client"` as the first line (uses `useTheme`).

## Acceptance Criteria
- TypeScript checks pass (`bun run check-types`).
- UI routes under `/_auth/*` resolve correctly and do not bypass the protected route tree.
- No runtime crashes from null query results or stale dialog state.
