# Convex Backend Guidelines

## Overview

Convex is a reactive backend-as-a-service. All backend code lives in `packages/backend/convex/`.

## File Structure

```
packages/backend/convex/
├── auth.config.ts       # Better-Auth configuration
├── auth.ts              # Auth-related functions
├── schema.ts            # Database schema
├── http.ts              # HTTP actions
├── convex.config.ts     # Convex configuration
└── [feature].ts         # Feature-specific functions
```

## Function Types

### Queries
Read-only operations that return data:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
```

### Mutations
Operations that modify data:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateUserProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      name: args.name,
      bio: args.bio,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

### Actions
Operations that can call external APIs:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    // Actions can call external APIs
    const response = await fetch("https://api.emailservice.com/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    // Actions can call mutations
    await ctx.runMutation(api.logs.create, {
      type: "email_sent",
      recipient: args.to,
    });

    return { success: true };
  },
});
```

## Schema Definition

Define your database schema in `schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published", "createdAt"]),
});
```

### Schema Best Practices

**Use indexes for queries:**
```typescript
// ✅ Good: indexed query
const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .unique();

// ❌ Bad: full table scan
const user = await ctx.db
  .query("users")
  .filter((q) => q.eq(q.field("email"), email))
  .unique();
```

**Use search indexes for text search:**
```typescript
defineTable({
  name: v.string(),
  description: v.string(),
})
  .searchIndex("search_name", { searchField: "name" })
  .searchIndex("search_description", { searchField: "description" });

// Query with search
const results = await ctx.db
  .query("posts")
  .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
  .collect();
```

## Authentication

### Better-Auth Configuration
Configure Better-Auth in `auth.config.ts`:

```typescript
import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

### Checking Authentication
Always check authentication in protected functions:

```typescript
// ✅ Good: check authentication
export const protectedQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Continue with authenticated logic
    return await ctx.db.query("privateData").collect();
  },
});

// ❌ Bad: no authentication check
export const unprotectedQuery = query({
  args: {},
  handler: async (ctx) => {
    // Anyone can call this!
    return await ctx.db.query("privateData").collect();
  },
});
```

### Authorization Patterns
Implement role-based access control:

```typescript
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return user;
}

export const adminOnlyMutation = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Admin-only logic here
  },
});
```

## Error Handling

### Throw Specific Errors
Use descriptive error messages:

```typescript
// ✅ Good: specific error messages
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error(`Post not found: ${args.postId}`);
    }

    const user = await getCurrentUser(ctx);
    if (post.authorId !== user._id) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// ❌ Bad: generic errors
export const deletePost = mutation({
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Error");
    await ctx.db.delete(args.postId);
  },
});
```

### Logging
Use `console.error` for debugging (visible in Convex dashboard):

```typescript
export const debugMutation = mutation({
  handler: async (ctx, args) => {
    try {
      // ... operation
    } catch (error) {
      console.error("Failed to process mutation:", error);
      throw error;
    }
  },
});
```

## Validation

Use Convex validators for all arguments:

```typescript
import { v } from "convex/values";

// ✅ Good: comprehensive validation
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    metadata: v.optional(v.object({
      views: v.number(),
      likes: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Args are fully typed and validated
    if (args.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }

    return await ctx.db.insert("posts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

## Performance Best Practices

### Minimize Database Queries
Batch queries when possible:

```typescript
// ✅ Good: single query with index
const userPosts = await ctx.db
  .query("posts")
  .withIndex("by_author", (q) => q.eq("authorId", userId))
  .collect();

// ❌ Bad: multiple queries in loop
const posts = await ctx.db.query("posts").collect();
const userPosts = [];
for (const post of posts) {
  if (post.authorId === userId) {
    userPosts.push(post);
  }
}
```

### Use Pagination
Implement pagination for large result sets:

```typescript
export const listPosts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## HTTP Actions

Define HTTP endpoints in `http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    // Verify webhook signature
    // Process webhook event
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
```

## Common Patterns

### Soft Deletes
Implement soft deletes instead of hard deletes:

```typescript
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      deleted: true,
      deletedAt: Date.now(),
    });
  },
});

// Filter out deleted items in queries
export const listPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").collect();
    return posts.filter((p) => !p.deleted);
  },
});
```

### Timestamps
Always include timestamps:

```typescript
// Creation
await ctx.db.insert("posts", {
  ...args,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Updates
await ctx.db.patch(postId, {
  ...updates,
  updatedAt: Date.now(),
});
```
