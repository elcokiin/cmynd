# Convex Backend Guidelines

## File Structure

**Root:** `packages/backend/convex/`

```
convex/
├── convex.config.ts          # Configuration
├── auth.config.ts            # Better-Auth config
├── schema.ts                 # Database schema
├── http.ts                   # HTTP endpoints
├── [feature].ts              # Public API (queries, mutations, actions)
└── model/[feature].ts        # Business logic helpers
```

---

## Execution Flow Rules

### MUST
- **Await all promises** - No floating promises
- **Use `internal.*`** (not `api.*`) for crons, scheduler, and `ctx.run*`
- **Use `ctx.runMutation`/`ctx.runQuery`** only inside Actions or Components
- **Derive identity** via `ctx.auth.getUserIdentity()`
- **Use `v.id("tableName")`** for ID arguments

### MUST NOT
- **Use `ctx.runMutation`/`ctx.runQuery`** inside Queries or Mutations (call `model/*` functions directly)
- **Use `ctx.runAction`** unless switching runtimes (Convex -> Node.js)
- **Use `.filter()`** on `ctx.db` queries (use `.withIndex()` or filter in memory after collection)
  - **Exception:** `.filter()` allowed only when chained with `.paginate()`
- **Use `.collect()`** on unbounded datasets (use `.take(n)` or `.paginate()`)
- **Accept userId, email, or permissions** as arguments for access control

---

## Implementation Patterns

### Database Query

```typescript
// ✅ Correct
const items = await ctx.db
  .query("tableName")
  .withIndex("indexName", (q) => q.eq("field", args.field))
  .take(100);

// ❌ Incorrect
const items = await ctx.db
  .query("tableName")
  .filter(q => q.eq(q.field("field"), args.field)) // BAD: Full table scan
  .collect();
```

### Mutation with Auth

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
      updatedAt: Date.now(), // Always include timestamps
    });
  },
});
```

### Internal Logic Separation

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
    return await Users.getActiveUser(ctx, identity.email); // Direct call, no ctx.run* overhead
  },
});
```

### Action (External API + Internal Mutation)

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

### Pagination

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

---

## Schema Definition

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
    .searchIndex("search_title", { searchField: "title" }), // Full-text search
});
```

**Index Rules:**
- Verify indexes are not redundant (e.g., if `["a", "b"]` exists, `["a"]` is redundant)
- Use composite indexes for common query patterns
- Add search indexes for full-text search needs

---

## HTTP Configuration

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

## Best Practices

1. **Timestamps** - Always include `createdAt` and `updatedAt` fields
2. **Soft deletes** - Use `deleted: boolean` instead of hard deletes where appropriate
3. **Argument validation** - Define args for all public functions (query, mutation, action)
4. **Business logic** - Extract to `convex/model/` helper functions for reusability
5. **Avoid sequential calls** - Actions should minimize sequential `ctx.runMutation` / `ctx.runQuery` calls
