# Pre-Commit Checklist

Before creating any commit, verify the following:

---

## Security

- [ ] All user inputs are validated with Zod
- [ ] Authentication/authorization checks are present in protected functions
- [ ] Sensitive data is filtered before returning from APIs
- [ ] User-generated HTML content is sanitized with DOMPurify

---

## TypeScript

- [ ] All exported functions have explicit return types
- [ ] Using `type` (not `interface`) for type definitions
- [ ] Using `satisfies` instead of `as` for type assertions
- [ ] Using `as const` for literal constants
- [ ] No `any` types (use `unknown` instead)
- [ ] Import order: type imports → external → internal → relative
- [ ] All type-only imports use `import type`
- [ ] File names follow convention (kebab-case for components, kebab-case for utils)
- [ ] Boolean variables have `is/has/should/can` prefix
- [ ] Explicit null checks for array/object access

---

## React

- [ ] No generics passed to `useForm`
- [ ] `defaultValues` are defined in forms
- [ ] All form fields use controlled inputs
- [ ] Zod validation on all form fields
- [ ] Error messages are displayed
- [ ] Submit button shows loading state (`form.state.isSubmitting`)
- [ ] Form prevents default submit behavior
- [ ] Components under 200 lines

---

## Convex

- [ ] All promises are awaited
- [ ] No `.filter()` on database queries (use `.withIndex()` or filter in TypeScript)
- [ ] All `.collect()` calls have bounded result sets (< 1000 docs)
- [ ] No redundant indexes in schema
- [ ] All public functions have argument validators
- [ ] All public functions have access control using `ctx.auth` (not spoofable args)
- [ ] All `ctx.run*`, `scheduler`, and `crons` use `internal.*` (never `api.*`)
- [ ] Business logic is in `convex/model/` helper functions
- [ ] All timestamps included (`createdAt`, `updatedAt`)

---

## Styling

- [ ] All classNames use `cn()` utility
- [ ] Components with 2+ variants use CVA
- [ ] No custom CSS classes (use Tailwind utilities)
- [ ] Mobile-first responsive design (sm → md → lg → xl → 2xl)
- [ ] Dark mode support included (`dark:` prefix)
- [ ] Semantic design tokens used (not hardcoded colors)
- [ ] Focus states on all interactive elements
- [ ] No magic numbers or arbitrary values
- [ ] No inline styles
- [ ] No `!important` modifiers

---

## Git

- [ ] Commit message follows Conventional Commits format
- [ ] Commit is atomic (one logical change)
- [ ] Commit message explains what changed and why
