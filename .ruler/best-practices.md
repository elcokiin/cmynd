# AI Agent Best Practices & Code Quality

**Audience**: This document is written for AI agents. Follow these rules when generating, modifying, or reviewing code.

---

## 🎯 Core Principles

### 1. Write Self-Documenting Code
Use descriptive, unambiguous names for all identifiers. Names must clearly communicate intent and purpose.

**Correct:**
```typescript
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

const isUserAuthenticated = session !== null;
const hasPermission = user.role === "admin";
```

**Incorrect:**
```typescript
function calc(arr: any[]): number {
  return arr.reduce((t, i) => t + i.p * i.q, 0);
}

const flag = session !== null;
const x = user.role === "admin";
```

### 2. Single Responsibility Principle
Each function must perform exactly one logical operation. If a function validates input, writes to a database, and sends an email, you must refactor it into three separate functions.

**Correct:**
```typescript
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
```

### 3. Avoid Deep Nesting (Maximum 3 Levels)
Use early returns and guard clauses to maintain flat code structure. Deep nesting is a code smell.

**Correct:**
```typescript
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
```

---

## 💬 Comments Policy

**Primary Rule**: Write code so clear that comments are unnecessary.

### When to Add Comments
Add comments ONLY to explain **"why"**, never **"what"**. The code itself should explain what it does.

**Acceptable:**
```typescript
// Use exponential backoff to avoid overwhelming the API during rate limits
const retryDelay = Math.pow(2, attemptCount) * 1000;

// Cache user preferences for 5 minutes to reduce database load
const CACHE_TTL = 5 * 60 * 1000;
```

**Unacceptable:**
```typescript
// Calculate retry delay
const retryDelay = Math.pow(2, attemptCount) * 1000;

// Get the user by ID
const user = await getUserById(id);

// Increment counter by 1
counter++;
```

### Document Complex Algorithms
For non-trivial algorithms, provide JSDoc comments explaining the approach, complexity, and any edge cases:

```typescript
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

### Avoid Excessive Comments
**Less is more.** Each comment is a maintenance burden and an admission that the code isn't clear enough.

**Before adding a comment, try:**
1. Rename variables/functions to be more descriptive
2. Extract complex logic into well-named helper functions
3. Simplify the code structure
4. Only if all else fails, add a comment explaining **why**

```typescript
// ✅ Good: no comments needed, code is self-explanatory
function isEligibleForDiscount(user: User, purchaseAmount: number): boolean {
  const isVipMember = user.membershipTier === "VIP";
  const meetsMinimumPurchase = purchaseAmount >= 100;
  return isVipMember && meetsMinimumPurchase;
}

// ❌ Bad: comments compensating for unclear code
function check(u: User, amt: number): boolean {
  // Check if user is VIP
  const x = u.membershipTier === "VIP";
  // Check if purchase is at least $100
  const y = amt >= 100;
  // Return true if both conditions met
  return x && y;
}
```

**Comment Smell Test:**
- If removing the comment makes code unclear → **refactor the code**
- If comment explains business logic rationale → **keep it**
- If comment describes what code does → **delete it**

```typescript
// ✅ Good: explains business decision (why)
// Apply 24-hour grace period per company policy to avoid support tickets
const dueDate = addHours(subscriptionEnd, 24);

// ❌ Bad: explains code operation (what)
// Add 24 hours to subscription end date
const dueDate = addHours(subscriptionEnd, 24);

// ✅ Good: no comment needed
const dueDateWithGracePeriod = addHours(subscriptionEnd, 24);
```

---

## 🛡️ Security (CRITICAL - NON-NEGOTIABLE)

Security violations are unacceptable. These rules have no exceptions.

### Rule 1: Always Validate User Input
**You MUST validate ALL external input using Zod.** Never trust data from users, APIs, or any external source.

**Correct:**
```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

function registerUser(input: unknown) {
  const validated = userSchema.parse(input);
  // validated is now type-safe and validated
}
```

**Incorrect:**
```typescript
function registerUser(input: any) {
  // Directly use untrusted input - SECURITY VIOLATION
  createUser(input.email, input.password);
}
```

### Rule 2: Always Enforce Authentication & Authorization
**You MUST check authentication in every protected backend function.** Use `ctx.auth.getUserIdentity()` in Convex.

**Correct:**
```typescript
export const getPrivateData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.query("privateData").collect();
  },
});
```

**Incorrect:**
```typescript
export const getPrivateData = query({
  handler: async (ctx) => {
    // SECURITY VIOLATION: No authentication check
    return await ctx.db.query("privateData").collect();
  },
});
```

### Rule 3: Never Expose Sensitive Data
**You MUST filter out sensitive fields** (passwords, tokens, API keys, etc.) before returning data.

**Correct:**
```typescript
const { password, tokenIdentifier, apiKey, ...publicUser } = user;
return publicUser;
```

**Incorrect:**
```typescript
return user; // SECURITY VIOLATION: Exposes password, tokens, etc.
```

### Rule 4: Always Sanitize User-Generated Content
**You MUST sanitize HTML** before rendering user-generated content to prevent XSS attacks. Use `DOMPurify`.

**Correct:**
```typescript
import DOMPurify from "dompurify";

function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

**Incorrect:**
```typescript
function UserBio({ bio }: { bio: string }) {
  // SECURITY VIOLATION: XSS vulnerability
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
```

---

## ⚡ Performance Requirements

### 1. Prefer Server Components
Default to React Server Components (standard in TanStack Start) for components without client-side interactivity.

```typescript
// Server component (no "use client" directive needed)
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Static content rendered on server</p>
    </div>
  );
}
```

### 2. Lazy Load Heavy Components
Use `React.lazy()` and `Suspense` for code splitting:

```typescript
import { lazy, Suspense } from "react";

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

### 3. Optimize Images
Always specify width, height, and use lazy loading:

```typescript
<img
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  loading="lazy"
/>
```

### 4. Leverage Convex Reactivity
Use `useConvexQuery` for automatic real-time updates. Do not manually refetch data.

```typescript
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

---

## 🚨 Error Handling

This project uses a **structured error management system** with the `@elcokiin/errors` package. **You MUST use these error classes and utilities instead of generic `throw new Error()`.**

---

### Backend Error Handling (Convex Functions)

#### Rule 1: Use Specific Error Classes
**You MUST throw specific error classes from `@elcokiin/errors/backend`** instead of generic errors.

**Available Error Classes:**
- **Authentication:** `UnauthenticatedError`, `UnauthorizedError`, `AdminRequiredError`
- **Documents:** `DocumentNotFoundError`, `DocumentOwnershipError`, `DocumentAlreadyPublishedError`, `DocumentPendingReviewError`, `DocumentPublishedError`, `DocumentValidationError`, `DocumentRateLimitError`, `DocumentInvalidStatusError`
- **Validation:** `ValidationError`, `ZodValidationError`

**Correct (Backend):**
```typescript
import { UnauthenticatedError, DocumentNotFoundError } from "@elcokiin/errors/backend";

export const getDocument = query({
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new UnauthenticatedError(); // Specific error
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new DocumentNotFoundError(); // Specific error
    }

    return document;
  },
});
```

**Incorrect (Backend):**
```typescript
// NEVER use generic Error in backend
if (!identity) {
  throw new Error("Not authenticated"); // FORBIDDEN
}

if (!document) {
  throw new Error("Document not found"); // FORBIDDEN
}
```

#### Rule 2: Error Classes Extend ConvexError
All backend error classes extend `ConvexError`, which means:
- Errors are properly serialized across Convex boundaries
- Errors appear in Convex dashboard with structured data
- Frontend can parse error codes and display user-friendly messages

---

### Frontend Error Handling (React Components)

#### Rule 3: Use `useErrorHandler` for Error Handling
**You MUST use `useErrorHandler`** for try/catch blocks in React components.

**Correct (Frontend):**
```typescript
import { useErrorHandler } from "@/hooks/use-error-handler";
import { useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

function CreateDocumentButton() {
  const [isCreating, setIsCreating] = useState(false);
  const { handleError } = useErrorHandler();
  const createDoc = useMutation(api.documents.create);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const documentId = await createDoc({ title: "New Doc" });
      toast.success("Document created!");
      navigate({ to: "/editor/$documentId", params: { documentId } });
    } catch (error) {
      handleError(error, { context: "CreateDocumentButton.handleCreate" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isCreating}>
      {isCreating ? "Creating..." : "Create Document"}
    </button>
  );
}
```

**Why use `useErrorHandler`:**
- Parses errors and extracts user-friendly messages
- Logs full error details (code, statusCode, message)
- `handleError()` shows toast + logs
- `handleErrorSilent()` only logs (for background operations)

#### Rule 4: Use `handleErrorSilent` for Background Operations
**For auto-save, debounced updates, or other non-critical operations**, use `handleErrorSilent()` to log errors without showing toast notifications.

**Correct (Background Operation):**
```typescript
import { useErrorHandler } from "@/hooks/use-error-handler";

function EditorRoute() {
  const { handleErrorSilent } = useErrorHandler();

  const handleAutoSave = async (content: JSONContent) => {
    try {
      await saveContent(content);
    } catch (error) {
      // Only logs error (no toast for auto-save)
      handleErrorSilent(error, "EditorRoute.handleAutoSave");
    }
  };
}
```

#### Rule 5: Use Error Utils Directly in Non-React Code
**For utilities/helpers (non-React files), import error utils directly.**

**Correct (Utility File):**
```typescript
import { parseError, getUserFriendlyMessage } from "@elcokiin/errors";

export async function uploadImage(file: File): Promise<string> {
  try {
    const url = await uploadToServer(file);
    return url;
  } catch (error) {
    const parsedError = parseError(error);
    const message = getUserFriendlyMessage(parsedError);
    console.error("[uploadImage]", message, {
      code: parsedError.code,
      error: parsedError,
    });
    throw parsedError; // Re-throw for caller to handle
  }
}
```

#### Rule 6: Error Boundary Catches Unhandled Errors
The root route has an Error Boundary that catches all unhandled React errors:

```typescript
// apps/studio/src/routes/__root.tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <Outlet />
</ErrorBoundary>
```

**You should still handle errors explicitly** in components. The Error Boundary is a safety net.

---

### Error Handling Checklist

Before submitting code, verify:

**Backend:**
- [ ] No generic `throw new Error()` statements
- [ ] All errors use specific classes from `@elcokiin/errors/backend`
- [ ] Authentication errors use `UnauthenticatedError` / `UnauthorizedError`
- [ ] Document errors use appropriate `Document*Error` classes
- [ ] Validation errors use `ValidationError` / `ZodValidationError`

**Frontend (React Components):**
- [ ] Try/catch blocks use `useErrorHandler` hook
- [ ] Error context includes component and method name (e.g., `"ComponentName.methodName"`)
- [ ] Auto-save/background operations use `handleErrorSilent()`

**Frontend (Utilities):**
- [ ] Non-React files import `parseError`, `getUserFriendlyMessage` directly
- [ ] Errors are logged with context tags: `[fileName.functionName]`
- [ ] Log includes error code and full error object

**All Code:**
- [ ] All async operations have error handling
- [ ] Error messages are descriptive and specific
- [ ] No sensitive data exposed in error messages

---

## 📝 Git Commit Standards

### Conventional Commits (MANDATORY)
**You MUST use Conventional Commits format.** This is not optional.

**Format**: `<type>: <subject>`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring (no behavior change)
- `chore:` - Build/tooling changes
- `docs:` - Documentation only
- `test:` - Adding or fixing tests
- `style:` - Code formatting (no logic change)

**Examples:**
```bash
feat: add user profile page
fix: resolve authentication redirect loop
refactor: simplify user validation logic
chore: update dependencies
docs: add API documentation
test: add tests for auth flow
```

### Atomic Commits
Each commit must represent ONE logical change. Do not mix unrelated changes.

**Correct:**
```bash
git commit -m "feat: add user registration form"
git commit -m "feat: add user registration API endpoint"
git commit -m "test: add tests for user registration"
```

**Incorrect:**
```bash
git commit -m "add registration, fix header bug, update deps"
```

### Clear, Descriptive Messages
Explain what changed and why:

```bash
feat: add email verification for new users

- Send verification email on signup
- Add email verification route
- Update user schema with emailVerified field
```

---

## 🏗️ Code Organization

### File Structure
Follow the existing project structure strictly:

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

### Code Grouping Within Files
Maintain consistent order within each file:

```typescript
// 1. Type imports
import type { User, Post } from "./types";

// 2. Value imports
import { someFunction } from "./utils";

// 3. Type definitions
type LocalType = { /* ... */ };

// 4. Constants
const MAX_POSTS = 10;
const CACHE_TTL = 5000;

// 5. Helper functions
function formatDate(date: Date): string { /* ... */ }
function validatePost(post: Post): boolean { /* ... */ }

// 6. Main component/export
function PostList() { /* ... */ }
```

### Use Barrel Exports
For directories with multiple modules, create an `index.ts` barrel file:

```typescript
// components/ui/index.ts
export { Button } from "./button";
export { Card, CardHeader, CardContent } from "./card";
export { Input } from "./input";

// Usage elsewhere
import { Button, Card, Input } from "@/components/ui";
```

---

## ✅ Pre-Commit Checklist

Before creating any commit, verify:

**Security & Validation:**
- [ ] All user inputs are validated with Zod
- [ ] Authentication/authorization checks are present in protected functions
- [ ] Sensitive data is filtered before returning from APIs

**Error Handling:**
- [ ] Backend errors use specific classes from `@elcokiin/errors/backend`
- [ ] Frontend mutations use `useErrorHandler` for try/catch blocks
- [ ] All async operations have error handling (try/catch)
- [ ] Error context includes component/function name
- [ ] No generic `throw new Error()` in backend code

**Code Quality:**
- [ ] Code follows single responsibility principle
- [ ] Nesting depth does not exceed 3 levels
- [ ] Names are descriptive and unambiguous
- [ ] Comments explain "why", not "what"

**Git Standards:**
- [ ] Commit message follows Conventional Commits format
- [ ] Commit is atomic (one logical change)
