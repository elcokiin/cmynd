# Convex Backend Guidelines
## Context & Structure

**Root:** `packages/backend/convex/`

### File Hierarchy:
- `convex.config.ts`: Configuration.
- `auth.config.ts`: Better-Auth config.
- `schema.ts`: defineSchema and defineTable definitions.
- `http.ts`: httpRouter endpoints.
- `[feature].ts`: Public API (Queries, Mutations, Actions).
- `model/[feature].ts`: Business logic helpers (Pure TS functions).
- `_generated/*`: Type definitions.

## Strict Constraints (Enforce These)

### Execution Flow
- **MUST** await all promises. No floating promises.
- **MUST** use `internal.*` (not `api.*`) for crons, scheduler, and `ctx.run*`.
- **MUST** use `ctx.runMutation`/`ctx.runQuery` only inside Actions or Components.
- **MUST NOT** use `ctx.runMutation`/`ctx.runQuery` inside Queries or Mutations. Call `model/*` functions directly.
- **MUST NOT** use `ctx.runAction` unless switching runtimes (Convex -> Node.js).

### Database Performance
- **MUST NOT** use `.filter()` on `ctx.db` queries. Use `.withIndex()` or filter in memory (JS array methods) after collection.
- **Exception:** `.filter()` is allowed only when chained with `.paginate()`.
- **MUST NOT** use `.collect()` on unbounded datasets. Use `.take(n)` or `.paginate()`.
- **MUST** verify indexes are not redundant (e.g., if `["a", "b"]` exists, `["a"]` is redundant).

### Security & Auth
- **MUST** define args for all public functions (query, mutation, action).
- **MUST NOT** accept userId, email, or permissions as arguments for access control.
- **MUST** derive identity via `ctx.auth.getUserIdentity()`.
- **MUST** use `v.id("tableName")` for ID arguments.

## Implementation Patterns
### Pattern: Database Query

**Correct:**
```typescript
const items = await ctx.db
  .query("tableName")
  .withIndex("indexName", (q) => q.eq("field", args.field))
  .take(100);
```

**Incorrect:**
```typescript
const items = await ctx.db
  .query("tableName")
  .filter(q => q.eq(q.field("field"), args.field)) // BAD: Full table scan
  .collect();
```
### Pattern: Mutation with Auth

```typescript
export const updateItem = mutation({
  args: { id: v.id("items"), data: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Authorization check
    const item = await ctx.db.get(args.id);
    if (item.ownerId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      data: args.data,
      updatedAt: Date.now(), // Timestamp pattern
    });
  },
});
```
### Pattern: Internal Logic Separation

**File: convex/model/users.ts**
```typescript
import { QueryCtx } from '../_generated/server';

export async function getActiveUser(ctx: QueryCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
}
```

**File: convex/users.ts (Public API)**
```typescript
import * as Users from './model/users';

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await Users.getActiveUser(ctx, identity.email); // Direct call, no overhead
  },
});
```
### Pattern: Action (External API + Internal Mutation)

```typescript
export const performTask = action({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    // 1. External Call
    const res = await fetch("https://api.external.com", { method: "POST" });
    if (!res.ok) throw new Error("API Failure");

    // 2. Internal Mutation (Single Transaction)
    await ctx.runMutation(internal.feature.saveResult, {
      status: "success",
      timestamp: Date.now()
    });
  },
});
```
### Pattern: Pagination

```typescript
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## Schema Definition

**File: convex/schema.ts**
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]), // Index for exact match

  posts: defineTable({
    title: v.string(),
    authorId: v.id("users"),
    deleted: v.boolean(), // Soft delete pattern
  })
    .index("by_author", ["authorId"])
    .searchIndex("search_title", { searchField: "title" }), // Search index
});
```

## HTTP Configuration

**File: convex/http.ts**
```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, { status: 200 });
  }),
});

export default http;
```

---

## Quick Reference Checklist

Before releasing to production, verify:

- [ ] All promises are awaited (enable `no-floating-promises` ESLint rule)
- [ ] No `.filter()` on database queries (use `.withIndex()` or filter in TypeScript)
- [ ] All `.collect()` calls have bounded result sets (< 1000 docs)
- [ ] No redundant indexes in schema
- [ ] All public functions have argument validators
- [ ] All public functions have access control using `ctx.auth` (not spoofable args)
- [ ] All `ctx.run*`, `scheduler`, and `crons` use `internal.*` (never `api.*`)
- [ ] Business logic is in `convex/model/` helper functions
- [ ] Actions avoid sequential `ctx.runMutation` / `ctx.runQuery` calls
- [ ] Queries/mutations prefer helper functions over `ctx.run*`
- [ ] `runAction` only used for Node.js runtime switching
- [ ] All timestamps included (`createdAt`, `updatedAt`)
- [ ] Soft deletes used instead of hard deletes where appropriate
