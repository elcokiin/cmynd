# TypeScript Style Guide

## TypeScript Configuration

This project uses strict TypeScript settings:
- `strict: true` - All strict checks enabled
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters
- `noUncheckedIndexedAccess: true` - Array/object access returns `T | undefined`
- `verbatimModuleSyntax: true` - Explicit imports/exports only

---

## Core Rules

### 1. Explicit Return Types for Exported Functions

**You MUST specify return types for all exported functions.**

```typescript
// ✅ Correct
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ❌ Incorrect
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Missing return type
}
```

### 2. Use `type` (Not `interface`)

**Prefer `type` for all type definitions.**

```typescript
// Object shapes
type AuthConfig = {
  providers: Array<AuthConfigProvider>;
};

// Unions
type Status = "pending" | "success" | "error";

// Props
type ButtonProps = {
  variant?: "default" | "outline";
  onClick?: () => void;
};
```

### 3. Use `satisfies` Over Type Assertions

**Use `satisfies` for type checking while preserving inference.**

```typescript
// ✅ Correct
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;

// ❌ Incorrect
export default {
  providers: [getAuthConfigProvider()],
} as AuthConfig; // Loses type checking
```

### 4. Use `as const` for Literal Constants

```typescript
const ROUTES = ["/dashboard", "/profile", "/settings"] as const;
type Route = typeof ROUTES[number]; // "/dashboard" | "/profile" | "/settings"
```

### 5. NEVER Use `any`

**Using `any` is forbidden. Use `unknown` and narrow with type guards.**

```typescript
// ✅ Correct
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

const result = parseJson(data);
if (isUser(result)) {
  console.log(result.name);
}

// ❌ Incorrect
function parseJson(input: string): any {
  return JSON.parse(input); // FORBIDDEN
}
```

---

## Import Order (MANDATORY)

**You MUST follow this exact import order:**

```typescript
// 1. Type imports
import type { AuthConfig } from "convex/server";
import type { VariantProps } from "class-variance-authority";

// 2. External dependencies
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

// 3. Internal imports
import { cn } from "@/lib/utils";

// 4. Relative imports
import { helper } from "./helper";
```

**Always use `import type` for type-only imports.**

---

## Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|-----------|---------|
| React components | `kebab-case.tsx` | `button.tsx`, `sign-in-form.tsx` |
| Utilities/hooks | `kebab-case.ts` | `auth-client.ts`, `utils.ts` |
| Routes | `kebab-case.tsx` | `dashboard.tsx`, `__root.tsx` |
| Type files | `kebab-case.ts` | `auth-types.ts` |

### Variables, Functions, Types

| Category | Convention | Example |
|----------|------------|---------|
| Variables | `camelCase` | `const authClient = ...` |
| Functions | `camelCase` | `function getAuthConfig() {}` |
| Components | `PascalCase` | `function Button() {}` |
| Types | `PascalCase` | `type AuthConfig = {}` |
| Constants | `SCREAMING_SNAKE_CASE` | `const API_URL = "..."` |

### Boolean Variables (MANDATORY Prefixes)

**All boolean variables MUST start with: `is`, `has`, `should`, `can`**

```typescript
// ✅ Correct
const isLoading = true;
const hasError = false;
const shouldRender = user !== null;
const canEdit = user?.role === "admin";

// ❌ Incorrect
const loading = true;    // Missing 'is' prefix
const error = false;     // Ambiguous - should be hasError
```

---

## Type Safety Patterns

### Explicit Null Checks

**With `noUncheckedIndexedAccess`, always check array/object access:**

```typescript
const user = users.find(u => u.id === id);
if (user) {
  console.log(user.name);
}

const firstUser = users[0];
if (firstUser) {
  console.log(firstUser.name);
}
```

### Discriminated Unions

**Use discriminated unions for complex state with type narrowing:**

```typescript
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };

function handleState(state: RequestState) {
  switch (state.status) {
    case "success":
      console.log(state.data); // TypeScript knows data exists
      break;
    case "error":
      console.log(state.error); // TypeScript knows error exists
      break;
  }
}
```

---

## TypeScript Utility Types

Leverage built-in utility types:

```typescript
// Select specific properties
type UserPreview = Pick<User, "id" | "name">;

// Exclude properties
type UserWithoutPassword = Omit<User, "password">;

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Object with specific keys
type IdMap = Record<string, User>;

// Extract return type
type Result = ReturnType<typeof fn>;
```
