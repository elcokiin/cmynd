# Best Practices & Code Quality

## Code Quality Principles

### Write Self-Documenting Code
Use clear, descriptive names that explain intent:

```typescript
// ✅ Good: clear intent
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

const isUserAuthenticated = session !== null;
const hasPermission = user.role === "admin";

// ❌ Bad: unclear names
function calc(arr: any[]): number {
  return arr.reduce((t, i) => t + i.p * i.q, 0);
}

const flag = session !== null;
const x = user.role === "admin";
```

### Keep Functions Small and Focused
Each function should do one thing well:

```typescript
// ✅ Good: single responsibility
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function validateUserInput(email: string, password: string): ValidationResult {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

// ❌ Bad: doing too much
function validateAndCreateUser(email: string, password: string) {
  // Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (password.length < 8) return null;
  
  // User creation
  const user = { email, password: hashPassword(password) };
  saveToDatabase(user);
  sendWelcomeEmail(email);
  logUserCreation(email);
  
  return user;
}
```

### Avoid Deep Nesting
Keep nesting to maximum 3 levels:

```typescript
// ✅ Good: early returns, flat structure
function processUser(user: User | null): ProcessResult {
  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (!user.isActive) {
    return { success: false, error: "User inactive" };
  }

  if (!user.hasPermission) {
    return { success: false, error: "No permission" };
  }

  return processActiveUser(user);
}

// ❌ Bad: deep nesting
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        return processActiveUser(user);
      } else {
        return { success: false };
      }
    } else {
      return { success: false };
    }
  } else {
    return { success: false };
  }
}
```

## Comments

### When to Comment
Add comments for "why" not "what":

```typescript
// ✅ Good: explains why
// Use exponential backoff to avoid overwhelming the API during rate limits
const retryDelay = Math.pow(2, attemptCount) * 1000;

// Cache user preferences for 5 minutes to reduce database load
const CACHE_TTL = 5 * 60 * 1000;

// ❌ Bad: explains what (code is self-explanatory)
// Calculate retry delay
const retryDelay = Math.pow(2, attemptCount) * 1000;

// Set cache time to live
const CACHE_TTL = 5 * 60 * 1000;
```

### Complex Logic Comments
Document complex algorithms:

```typescript
// ✅ Good: explains complex logic
/**
 * Implements a sliding window rate limiter using timestamps.
 * Maintains a fixed-size window of recent requests and only
 * allows requests if the count is below the threshold.
 * 
 * Time complexity: O(n) where n is the window size
 * Space complexity: O(n)
 */
function rateLimiter(userId: string, limit: number, windowMs: number): boolean {
  // Implementation...
}
```

### Avoid Obvious Comments
```typescript
// ❌ Bad: stating the obvious
// Get the user by ID
const user = await getUserById(id);

// Increment counter by 1
counter++;

// ✅ Good: no comment needed, code is clear
const user = await getUserById(id);
counter++;
```

## Error Handling

### Use Try-Catch for Async Operations
```typescript
// ✅ Good: proper error handling
async function fetchUserData(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return null;
  }
}

// ❌ Bad: no error handling
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return await response.json();
}
```

### Throw Specific Error Types
```typescript
// ✅ Good: specific error types
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function authenticateUser(token: string): User {
  if (!token) {
    throw new AuthenticationError("Token is required");
  }
  
  const user = verifyToken(token);
  if (!user) {
    throw new AuthenticationError("Invalid token");
  }
  
  return user;
}

// ❌ Bad: generic errors
function authenticateUser(token: string) {
  if (!token) throw new Error("Error");
  const user = verifyToken(token);
  if (!user) throw new Error("Error");
  return user;
}
```

### Handle Errors at Appropriate Boundaries
```typescript
// ✅ Good: error boundary at component level
function UserProfile() {
  const { data: user, error } = useConvexQuery(api.users.getCurrentUser, {});

  if (error) {
    return <ErrorMessage message="Failed to load user profile" />;
  }

  if (!user) {
    return <Skeleton />;
  }

  return <ProfileDisplay user={user} />;
}
```

## Performance

### React Server Components (TanStack Start)
Use server components where possible:

```typescript
// ✅ Good: server component for static data
// app/routes/about.tsx
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Static content rendered on server</p>
    </div>
  );
}
```

### Lazy Loading
Lazy load heavy components:

```typescript
// ✅ Good: lazy loading
import { lazy } from "react";

const HeavyChart = lazy(() => import("@/components/heavy-chart"));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### Optimize Images
```typescript
// ✅ Good: optimized images
<img
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  loading="lazy"
/>

// Consider using next-gen formats: WebP, AVIF
```

### Use Convex's Reactive Queries
Leverage Convex's reactivity:

```typescript
// ✅ Good: reactive query updates automatically
function UserList() {
  const users = useConvexQuery(api.users.list, {});
  
  // Component re-renders automatically when data changes
  return (
    <ul>
      {users?.map(user => <li key={user._id}>{user.name}</li>)}
    </ul>
  );
}
```

## Security

### Validate All User Input
Always validate with Zod:

```typescript
import { z } from "zod";

// ✅ Good: Zod validation
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

function registerUser(input: unknown) {
  const validated = userSchema.parse(input);
  // validated is now type-safe and validated
}

// ❌ Bad: no validation
function registerUser(input: any) {
  // Directly use untrusted input
  createUser(input.email, input.password);
}
```

### Use Convex's Built-in Auth
Always check authentication:

```typescript
// ✅ Good: protected endpoint
export const getPrivateData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.query("privateData").collect();
  },
});

// ❌ Bad: no auth check
export const getPrivateData = query({
  handler: async (ctx) => {
    return await ctx.db.query("privateData").collect();
  },
});
```

### Never Expose Sensitive Data
```typescript
// ✅ Good: filter sensitive data
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) return null;

    // Remove sensitive fields
    const { password, tokenIdentifier, ...publicUser } = user;
    return publicUser;
  },
});

// ❌ Bad: exposing everything
export const getCurrentUser = query({
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user; // Includes password, tokens, etc.
  },
});
```

### Sanitize User-Generated Content
```typescript
// ✅ Good: sanitize before rendering
import DOMPurify from "dompurify";

function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ❌ Bad: directly rendering user content
function UserBio({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
```

## Git Commits

### Conventional Commits Format
Use conventional commits:

```bash
# Feature
git commit -m "feat: add user profile page"

# Bug fix
git commit -m "fix: resolve authentication redirect loop"

# Chore
git commit -m "chore: update dependencies"

# Documentation
git commit -m "docs: add API documentation"

# Refactor
git commit -m "refactor: simplify user validation logic"

# Style
git commit -m "style: format code with prettier"

# Test
git commit -m "test: add tests for auth flow"
```

### Write Clear Commit Messages
```bash
# ✅ Good: descriptive and focused
git commit -m "feat: add email verification for new users

- Send verification email on signup
- Add email verification route
- Update user schema with emailVerified field"

# ❌ Bad: vague or too generic
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "changes"
```

### Keep Commits Atomic
One logical change per commit:

```bash
# ✅ Good: atomic commits
git commit -m "feat: add user registration form"
git commit -m "feat: add user registration API endpoint"
git commit -m "test: add tests for user registration"

# ❌ Bad: mixed changes
git commit -m "add registration, fix header bug, update deps"
```

## Code Organization

### Group Related Code
```typescript
// ✅ Good: organized imports and code
// Types
type User = { /* ... */ };
type Post = { /* ... */ };

// Constants
const MAX_POSTS = 10;
const CACHE_TTL = 5000;

// Helper functions
function formatDate(date: Date): string { /* ... */ }
function validatePost(post: Post): boolean { /* ... */ }

// Main component
function PostList() { /* ... */ }
```

### Use Barrel Exports
```typescript
// components/ui/index.ts
export { Button } from "./button";
export { Card, CardHeader, CardContent } from "./card";
export { Input } from "./input";

// Usage
import { Button, Card, Input } from "@/components/ui";
```

### Consistent File Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── lib/              # Utilities and helpers
├── hooks/            # Custom React hooks
└── routes/           # Route components
```
