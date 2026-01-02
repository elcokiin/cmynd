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
├── model/               # Business logic helpers (recommended)
│   ├── users.ts
│   ├── posts.ts
│   └── [feature].ts
└── [feature].ts         # Feature-specific public API
```

## Critical Best Practices

### 1. Always Await All Promises

**Why**: Unawaited promises can cause missed errors, failed scheduling, or incomplete database operations.

```typescript
// ❌ Bad: floating promises
export const scheduleJob = mutation({
  handler: async (ctx, args) => {
    ctx.scheduler.runAfter(1000, internal.jobs.process, args); // Not awaited!
    ctx.db.patch(args.id, { status: "scheduled" }); // Not awaited!
  },
});

// ✅ Good: all promises awaited
export const scheduleJob = mutation({
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(1000, internal.jobs.process, args);
    await ctx.db.patch(args.id, { status: "scheduled" });
  },
});
```

**How to enforce**: Enable the `no-floating-promises` ESLint rule with TypeScript.

### 2. Avoid `.filter()` on Database Queries

**Why**: `.filter()` has the same performance as filtering in TypeScript code, and is less flexible. Use `.withIndex()` for large datasets or filter in TypeScript for small ones.

```typescript
// ❌ Bad: using .filter() on query
const tomsMessages = await ctx.db
  .query("messages")
  .filter((q) => q.eq(q.field("author"), "Tom"))
  .collect();

// ✅ Good Option 1: Use an index (for large/unbounded datasets)
const tomsMessages = await ctx.db
  .query("messages")
  .withIndex("by_author", (q) => q.eq("author", "Tom"))
  .collect();

// ✅ Good Option 2: Filter in TypeScript (for small datasets)
const allMessages = await ctx.db.query("messages").collect();
const tomsMessages = allMessages.filter((m) => m.author === "Tom");
```

**How to find**: Search for `\.filter\(\(?q` in your Convex codebase.

**Exception**: `.filter()` is useful on paginated queries (`.paginate()`) to ensure the correct page size.

### 3. Only Use `.collect()` with Small Result Sets

**Why**: All results count toward database bandwidth. If any document changes, the query re-runs. For 1000+ documents, use indexes, pagination, `.take()`, or denormalization.

```typescript
// ❌ Bad: potentially unbounded
const allMovies = await ctx.db.query("movies").collect();
const spielbergMovies = allMovies.filter((m) => m.director === "Steven Spielberg");

// ✅ Good: use index to limit results
const spielbergMovies = await ctx.db
  .query("movies")
  .withIndex("by_director", (q) => q.eq("director", "Steven Spielberg"))
  .collect();

// ❌ Bad: loading all watched movies
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .collect();
const count = watchedMovies.length;

// ✅ Good: use pagination
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .order("desc")
  .paginate(paginationOptions);

// ✅ Good: use .take() for counts with limit
const watchedMovies = await ctx.db
  .query("watchedMovies")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .take(100);
const count = watchedMovies.length === 100 ? "99+" : watchedMovies.length.toString();

// ✅ Good: denormalize count in separate table
const watchedCount = await ctx.db
  .query("watchedMoviesCount")
  .withIndex("by_user", (q) => q.eq("user", userId))
  .unique();
```

**How to find**: Search for `\.collect\(` in your Convex codebase and verify result set size is bounded.

**Exception**: Migrations or batch processing may intentionally load large datasets via actions.

### 4. Check for Redundant Indexes

**Why**: Indexes like `by_foo` and `by_foo_and_bar` are usually redundant. Removing redundant indexes saves storage and reduces write overhead.

```typescript
// ❌ Bad: redundant indexes
.index("by_team", ["team"])
.index("by_team_and_user", ["team", "user"])  // Redundant! Remove by_team

// ✅ Good: use compound index for both queries
.index("by_team_and_user", ["team", "user"])

// Query all team members
const allMembers = await ctx.db
  .query("teamMembers")
  .withIndex("by_team_and_user", (q) => q.eq("team", teamId))
  .collect();

// Query specific member
const member = await ctx.db
  .query("teamMembers")
  .withIndex("by_team_and_user", (q) => q.eq("team", teamId).eq("user", userId))
  .unique();
```

**Exception**: Indexes are NOT redundant when sorting differs:
```typescript
// These are NOT redundant:
.index("by_channel", ["channel"]) // Sorts by: channel, _creationTime
.index("by_channel_and_author", ["channel", "author"]) // Sorts by: channel, author, _creationTime

// Use case: most recent messages in channel
// Requires by_channel (can't use by_channel_and_author)
const recentMessages = await ctx.db
  .query("messages")
  .withIndex("by_channel", (q) => q.eq("channel", channelId))
  .order("desc")
  .take(50);
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

    // Actions should call internal mutations
    await ctx.runMutation(internal.logs.create, {
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

## Authentication & Authorization

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

### Access Control Must Use `ctx.auth`, Not Spoofable Arguments

**Critical Security Rule**: Never use spoofable arguments (like `email`, `username`) for access control. Only use `ctx.auth.getUserIdentity()` or unguessable IDs (UUIDs, Convex IDs).

```typescript
// ❌ DANGEROUS: email can be spoofed by attacker
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    email: v.string(),
    update: v.object({ name: v.string() }),
  },
  handler: async (ctx, { id, email, update }) => {
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("team", id))
      .collect();
    
    // ❌ Attacker can pass any email!
    if (!teamMembers.some((m) => m.email === email)) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(id, update);
  },
});

// ✅ SECURE: uses ctx.auth which cannot be spoofed
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    update: v.object({ name: v.string() }),
  },
  handler: async (ctx, { id, update }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const isTeamMember = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) => q.eq("team", id).eq("user", user._id))
      .unique();

    if (!isTeamMember) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(id, update);
  },
});
```

### Authorization Patterns
Implement role-based access control with helper functions:

```typescript
// Helper function for common auth checks
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

### Granular Functions Over Generic Updates

Prefer specific functions with granular permissions:

```typescript
// ❌ Bad: one function with broad permissions
export const updateTeam = mutation({
  args: {
    id: v.id("teams"),
    update: v.object({
      name: v.optional(v.string()),
      owner: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, { id, update }) => {
    // How do we check permissions? Owner change needs different auth than name change
    await ctx.db.patch(id, update);
  },
});

// ✅ Good: separate functions with specific permissions
export const setTeamOwner = mutation({
  args: {
    id: v.id("teams"),
    owner: v.id("users"),
  },
  handler: async (ctx, { id, owner }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    const team = await ctx.db.get(id);
    if (team.owner !== user.subject) {
      throw new Error("Only current owner can change ownership");
    }
    
    await ctx.db.patch(id, { owner });
  },
});

export const setTeamName = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
  },
  handler: async (ctx, { id, name }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    const isTeamMember = /* check membership */;
    if (!isTeamMember) {
      throw new Error("Only team members can update name");
    }
    
    await ctx.db.patch(id, { name });
  },
});
```

## Validation

### Use Argument Validators for All Public Functions

**Critical Security Rule**: All public functions must have argument validators to prevent attacks.

```typescript
// ❌ DANGEROUS: no validation - attacker could pass any ID or malicious data
export const updateMessage = mutation({
  handler: async (ctx, { id, update }) => {
    await ctx.db.patch(id, update);
  },
});

// ✅ SECURE: strict validation
export const updateMessage = mutation({
  args: {
    id: v.id("messages"),
    update: v.object({
      body: v.optional(v.string()),
      author: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, update }) => {
    // id is guaranteed to be from messages table
    // update can only contain body and author fields
    await ctx.db.patch(id, update);
  },
});
```

Comprehensive validation example:

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

## Internal Functions & Code Organization

### Only Schedule and `ctx.run*` Internal Functions

**Critical Rule**: Never use `api.*` functions in `ctx.runQuery`, `ctx.runMutation`, `ctx.scheduler`, or `crons.ts`. Always use `internal.*`.

**Why**: Public functions can be called by attackers and need strict access control. Internal functions are only callable from within Convex and can have relaxed checks.

```typescript
// ❌ Bad: scheduling public function
import { api } from "./_generated/api";

crons.daily(
  "send daily reminder",
  { hourUTC: 17, minuteUTC: 30 },
  api.messages.sendMessage, // ❌ Never use api in crons!
  { author: "System", body: "Daily update!" },
);

// ❌ Bad: action calling public mutation
export const processData = action({
  handler: async (ctx) => {
    await ctx.runMutation(api.messages.sendMessage, { /* ... */ }); // ❌
  },
});

// ✅ Good: use internal functions
import { internal } from "./_generated/api";

crons.daily(
  "send daily reminder",
  { hourUTC: 17, minuteUTC: 30 },
  internal.messages.sendInternal,
  { author: "System", body: "Daily update!" },
);

export const processData = action({
  handler: async (ctx) => {
    await ctx.runMutation(internal.messages.sendInternal, { /* ... */ });
  },
});
```

**Pattern**: Share code via helper functions:

```typescript
// convex/model/messages.ts
import { MutationCtx } from '../_generated/server';

export async function sendMessage(
  ctx: MutationCtx,
  args: { body: string; author: string },
) {
  await ctx.db.insert("messages", {
    ...args,
    createdAt: Date.now(),
  });
}

// convex/messages.ts
import * as Messages from './model/messages';

// Public: has authentication
export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    
    await Messages.sendMessage(ctx, { body, author: user.name ?? "Anonymous" });
  },
});

// Internal: no auth needed (only callable from Convex)
export const sendInternal = internalMutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    await Messages.sendMessage(ctx, args);
  },
});
```

### Use Helper Functions to Write Shared Code

**Architecture**: Most logic should be in `convex/model/` as plain TypeScript functions. Public API functions (`query`, `mutation`, `action`) should be thin wrappers.

```typescript
// ❌ Bad: logic in public function, repeated ctx.run* calls
// convex/conversations.ts
export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const user = await ctx.runQuery(api.users.getCurrentUser); // ❌ Unnecessary overhead
    const conversation = await ctx.db.get(conversationId);
    if (!conversation?.members.includes(user._id)) {
      throw new Error("Unauthorized");
    }
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversation", conversationId))
      .collect();
    return messages;
  },
});

// ✅ Good: logic in model directory
// convex/model/users.ts
import { QueryCtx } from '../_generated/server';

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  
  if (!user) throw new Error("User not found");
  return user;
}

// convex/model/conversations.ts
import { QueryCtx, MutationCtx } from '../_generated/server';
import * as Users from './users';

export async function ensureHasAccess(
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) {
  const user = await Users.getCurrentUser(ctx);
  const conversation = await ctx.db.get(conversationId);
  
  if (!conversation || !conversation.members.includes(user._id)) {
    throw new Error("Unauthorized");
  }
  
  return { user, conversation };
}

export async function listMessages(
  ctx: QueryCtx,
  { conversationId }: { conversationId: Id<"conversations"> },
) {
  await ensureHasAccess(ctx, { conversationId });
  
  return await ctx.db
    .query("messages")
    .withIndex("by_conversation", (q) => q.eq("conversation", conversationId))
    .collect();
}

// convex/conversations.ts - thin wrapper
import * as Conversations from './model/conversations';

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: (ctx, args) => Conversations.listMessages(ctx, args),
});
```

### Avoid Sequential `ctx.runMutation` / `ctx.runQuery` in Actions

**Why**: Each runs in separate transaction, which can lead to inconsistent results.

```typescript
// ❌ Bad: inconsistent results
export const sendBillingReminder = action({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await ctx.runQuery(internal.teams.get, { teamId });
    const owner = await ctx.runQuery(internal.users.get, { userId: team.owner });
    // ❌ Team could have changed between these two queries!
    assert(team.owner === owner._id); // Could fail!
  },
});

// ✅ Good: single transaction
export const sendBillingReminder = action({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const { team, owner } = await ctx.runQuery(
      internal.teams.getTeamAndOwner,
      { teamId }
    );
    assert(team.owner === owner._id); // ✅ Always consistent
  },
});

export const getTeamAndOwner = internalQuery({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    const team = await Teams.load(ctx, { teamId });
    const owner = await Users.load(ctx, { userId: team.owner });
    return { team, owner };
  },
});
```

**Loop pattern:**

```typescript
// ❌ Bad: separate mutation for each item
export const importTeams = action({
  args: { members: v.array(v.object({ name: v.string(), email: v.string() })) },
  handler: async (ctx, { members }) => {
    for (const member of members) {
      await ctx.runMutation(internal.teams.insertUser, member); // ❌ Multiple transactions
    }
  },
});

// ✅ Good: single transaction for all items
export const importTeams = action({
  args: { members: v.array(v.object({ name: v.string(), email: v.string() })) },
  handler: async (ctx, { members }) => {
    await ctx.runMutation(internal.teams.insertUsers, { members });
  },
});

export const insertUsers = internalMutation({
  args: { members: v.array(v.object({ name: v.string(), email: v.string() })) },
  handler: async (ctx, { members }) => {
    for (const member of members) {
      await ctx.db.insert("users", { ...member, createdAt: Date.now() });
    }
  },
});
```

**Exception**: Intentional batch processing for large datasets (migrations, aggregations).

### Use `ctx.runMutation` / `ctx.runQuery` Sparingly

**Why**: These have overhead compared to plain TypeScript functions. Prefer helper functions.

```typescript
// ❌ Bad: unnecessary overhead
export const listMessages = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrent); // ❌ Overhead
    // ...
  },
});

// ✅ Good: direct helper function call
export const listMessages = query({
  handler: async (ctx) => {
    const user = await Users.getCurrent(ctx); // ✅ No overhead
    // ...
  },
});
```

**Exceptions**:
1. **Components**: Require `ctx.runQuery` or `ctx.runMutation`
2. **Partial rollback**: When you need transaction rollback behavior

```typescript
// Valid use case: partial rollback
export const trySendMessage = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.messages.send, args);
    } catch (e) {
      // Rollback sendMessage changes, but keep failure log
      await ctx.db.insert("failures", {
        kind: "MessageFailed",
        error: `Error: ${e}`,
        ...args,
      });
    }
  },
});
```

### Use `runAction` Only for Different Runtime (Node.js)

**Why**: `runAction` has overhead. Only use when switching from Convex runtime to Node.js runtime.

```typescript
// ❌ Bad: unnecessary runAction
export const scrapeWebsite = action({
  args: { siteMapUrl: v.string() },
  handler: async (ctx, { siteMapUrl }) => {
    const siteMap = await fetch(siteMapUrl);
    const pages = /* parse sitemap */;
    
    await Promise.all(
      pages.map((page) =>
        ctx.runAction(internal.scrape.scrapeSinglePage, { url: page }) // ❌ Overhead
      ),
    );
  },
});

// ✅ Good: plain function call
import * as Scrape from './model/scrape';

export const scrapeWebsite = action({
  args: { siteMapUrl: v.string() },
  handler: async (ctx, { siteMapUrl }) => {
    const siteMap = await fetch(siteMapUrl);
    const pages = /* parse sitemap */;
    
    await Promise.all(
      pages.map((page) => Scrape.scrapeSinglePage(ctx, { url: page })) // ✅ Direct
    );
  },
});
```

**Valid use case**: Calling Node.js-specific code from Convex runtime action.

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
