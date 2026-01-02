# TypeScript Style Guide

## Strict Configuration

This project uses strict TypeScript settings:
- `strict: true` - All strict checks enabled
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters
- `noFallthroughCasesInSwitch: true` - Error on switch fallthrough
- `noUncheckedIndexedAccess: true` - Array/object access returns `T | undefined`
- `verbatimModuleSyntax: true` - Explicit imports/exports only

## Type Annotations

### Explicit Return Types
Always use explicit return types for exported functions:

```typescript
// ✅ Good
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ❌ Bad
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Type vs Interface
- Use `type` for object shapes and unions
- Use `interface` for extensible contracts (rare in this codebase)

```typescript
// ✅ Good: type for object shape
type AuthConfig = {
  providers: Array<AuthConfigProvider>;
};

// ✅ Good: type for union
type Status = "pending" | "success" | "error";
```

### Type Inference Patterns

**Use `satisfies` over type assertions:**
```typescript
// ✅ Good: satisfies provides better type inference
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;

// ❌ Bad: type assertion loses type checking
export default {
  providers: [getAuthConfigProvider()],
} as AuthConfig;
```

**Use `as const` for immutable literals:**
```typescript
// ✅ Good: as const for readonly tuple/object
const ROUTES = ["/dashboard", "/profile", "/settings"] as const;
type Route = typeof ROUTES[number]; // "/dashboard" | "/profile" | "/settings"

// ❌ Bad: mutable array type
const ROUTES = ["/dashboard", "/profile", "/settings"];
```

### Avoid `any`
Never use `any`. Use `unknown` or proper types:

```typescript
// ✅ Good
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

// ❌ Bad
function parseJson(input: string): any {
  return JSON.parse(input);
}
```

## Import Style

### Import Order
1. Type imports (using `import type`)
2. External dependencies (React, libraries)
3. Internal imports (aliases like `@/`)
4. Relative imports

### Type Imports
Always use `import type` for type-only imports:

```typescript
// ✅ Good: type imports separated
import type { AuthConfig } from "convex/server";
import type { VariantProps } from "class-variance-authority";

import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

// ❌ Bad: mixed value and type imports
import { AuthConfig } from "convex/server";
import { cn } from "@/lib/utils";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
```

### Path Aliases
- Use `@/*` for `apps/web/src/*` imports
- Use `workspace:*` for internal packages
- Use `catalog:` for shared dependencies

## Naming Conventions

### Files & Directories
- **React components**: PascalCase (`Button.tsx`, `SignInForm.tsx`)
- **Utilities/hooks**: kebab-case (`auth-client.ts`, `utils.ts`)
- **Routes**: kebab-case or special (`__root.tsx`, `dashboard.tsx`)
- **Types/interfaces files**: kebab-case (`auth-types.ts`)

### Variables & Functions
```typescript
// camelCase for variables and functions
const authClient = createAuthClient();
function getAuthConfig() { }

// PascalCase for components, types, interfaces
function Button() { }
type AuthConfig = { };
interface UserProps { }

// SCREAMING_SNAKE_CASE for constants
const API_URL = "https://api.example.com";
const MAX_RETRIES = 3;
```

### Booleans
Prefix with `is`, `has`, `should`, `can`:

```typescript
// ✅ Good
const isLoading = true;
const hasError = false;
const shouldRender = user !== null;
const canEdit = user?.role === "admin";

// ❌ Bad
const loading = true;
const error = false;
```

## Type Safety Best Practices

### Avoid Optional Chaining Overuse
With `noUncheckedIndexedAccess`, be explicit:

```typescript
// ✅ Good: explicit null check
const user = users.find(u => u.id === id);
if (user) {
  console.log(user.name);
}

// ⚠️ Acceptable: when you know it won't throw
const firstUser = users[0];
if (firstUser) {
  console.log(firstUser.name);
}
```

### Function Overloads
Use function overloads for complex type scenarios:

```typescript
// ✅ Good: overloads provide precise types
function createElement(tag: "button"): HTMLButtonElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}
```

### Discriminated Unions
Use discriminated unions for state management:

```typescript
// ✅ Good: discriminated union
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

## Common Patterns

### Utility Types
Leverage TypeScript utility types:

```typescript
// Pick specific properties
type UserPreview = Pick<User, "id" | "name" | "email">;

// Omit properties
type UserWithoutPassword = Omit<User, "password">;

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;
```

### Generic Constraints
Use generic constraints for reusable functions:

```typescript
// ✅ Good: constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "John", age: 30 };
const name = getProperty(user, "name"); // type: string
```
