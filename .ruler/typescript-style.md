# AI Agent TypeScript Style Guide

**Audience**: This document defines TypeScript patterns for AI agents. All rules are mandatory.

---

## TypeScript Configuration

**The project uses strict TypeScript settings:**
- `strict: true` - All strict checks enabled
- `noUnusedLocals: true` - Error on unused variables
- `noUnusedParameters: true` - Error on unused parameters
- `noFallthroughCasesInSwitch: true` - Error on switch fallthrough
- `noUncheckedIndexedAccess: true` - Array/object access returns `T | undefined`
- `verbatimModuleSyntax: true` - Explicit imports/exports only

---

## Rule 1: Explicit Return Types for Exported Functions
**You MUST specify return types for all exported functions.**

**Correct:**
```typescript
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Incorrect:**
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Missing return type
}
```

---

## Rule 2: Use `type` (Not `interface`)
**Prefer `type` for all type definitions. Only use `interface` for extensible contracts (rare).**

**Correct:**
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

---

## Rule 3: Use `satisfies` Over Type Assertions
**Use `satisfies` for type checking while preserving inference. Never use `as` for type assertions unless absolutely necessary.**

**Correct:**
```typescript
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

**Incorrect:**
```typescript
export default {
  providers: [getAuthConfigProvider()],
} as AuthConfig; // Loses type checking
```

---

## Rule 4: Use `as const` for Literal Constants
**Use `as const` to create immutable literal types.**

**Correct:**
```typescript
const ROUTES = ["/dashboard", "/profile", "/settings"] as const;
type Route = typeof ROUTES[number]; // "/dashboard" | "/profile" | "/settings"
```

**Incorrect:**
```typescript
const ROUTES = ["/dashboard", "/profile", "/settings"]; // Mutable string[]
```

---

## Rule 5: NEVER Use `any`
**Using `any` is forbidden. Use `unknown` and narrow with type guards.**

**Correct:**
```typescript
function parseJson(input: string): unknown {
  return JSON.parse(input);
}

// Use with type guard
const result = parseJson(data);
if (isUser(result)) {
  console.log(result.name);
}
```

**Incorrect:**

```typescript
function parseJson(input: string): any {
  return JSON.parse(input); // FORBIDDEN
}
```

---

## Rule 6: Import Order (MANDATORY)
**You MUST follow this exact import order:**

1. **Type imports** (using `import type`)
2. **External dependencies** (React, npm packages)
3. **Internal imports** (aliases like `@/`)
4. **Relative imports** (`./ ../`)

---

## Rule 7: ALWAYS Use `import type` for Type-Only Imports
**Separate type imports from value imports using `import type`.**

**Correct:**
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

**Incorrect:**
```typescript
// Mixed imports without order
import { AuthConfig } from "convex/server"; // Should be import type
import { cn } from "@/lib/utils";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
```

---

## Naming Conventions

### Files & Directories (MANDATORY)
- **React components**: `PascalCase.tsx` (e.g., `Button.tsx`, `SignInForm.tsx`)
- **Utilities/hooks**: `kebab-case.ts` (e.g., `auth-client.ts`, `utils.ts`)
- **Routes**: `kebab-case.tsx` or special (e.g., `__root.tsx`, `dashboard.tsx`)
- **Type files**: `kebab-case.ts` (e.g., `auth-types.ts`)

### Variables, Functions, Types
| Category | Convention | Example |
|----------|------------|---------|
| Variables | `camelCase` | `const authClient = ...` |
| Functions | `camelCase` | `function getAuthConfig() {}` |
| Components | `PascalCase` | `function Button() {}` |
| Types/Interfaces | `PascalCase` | `type AuthConfig = {}` |
| Constants | `SCREAMING_SNAKE_CASE` | `const API_URL = "..."` |

### Boolean Variables (MANDATORY Prefixes)
**All boolean variables MUST start with: `is`, `has`, `should`, `can`**

**Correct:**
```typescript
const isLoading = true;
const hasError = false;
const shouldRender = user !== null;
const canEdit = user?.role === "admin";
```

**Incorrect:**
```typescript
const loading = true;    // Missing 'is' prefix
const error = false;     // Ambiguous - should be hasError
```

---

## Type Safety Patterns

### Explicit Null Checks (Required by `noUncheckedIndexedAccess`)
**With strict null checks enabled, always check array/object access:**

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

### Discriminated Unions (State Management)
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

**Leverage built-in utility types instead of creating custom types:**

| Utility Type | Purpose | Example |
|--------------|---------|---------|
| `Pick<T, K>` | Select specific properties | `type UserPreview = Pick<User, "id" \| "name">` |
| `Omit<T, K>` | Exclude properties | `type UserWithoutPassword = Omit<User, "password">` |
| `Partial<T>` | Make all properties optional | `type PartialUser = Partial<User>` |
| `Required<T>` | Make all properties required | `type RequiredUser = Required<User>` |
| `Record<K, T>` | Object with specific keys | `type IdMap = Record<string, User>` |
| `ReturnType<T>` | Extract return type | `type Result = ReturnType<typeof fn>` |

---

## Generic Constraints

**Use generic constraints for type-safe reusable functions:**

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "John", age: 30 };
const name = getProperty(user, "name"); // type: string (correctly inferred)
```

---

## Function Overloads (Advanced)

**Use function overloads for precise return types based on input:**

```typescript
function createElement(tag: "button"): HTMLButtonElement;
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

const btn = createElement("button"); // Type: HTMLButtonElement
const div = createElement("div");    // Type: HTMLDivElement
```

---

## TypeScript Checklist

Before submitting TypeScript code, verify:

- [ ] All exported functions have explicit return types
- [ ] Using `type` (not `interface`) for type definitions
- [ ] Using `satisfies` instead of `as` for type assertions
- [ ] Using `as const` for literal constants
- [ ] No `any` types (use `unknown` instead)
- [ ] Import order: type imports → external → internal → relative
- [ ] All type-only imports use `import type`
- [ ] File names follow convention (PascalCase for components, kebab-case for utils)
- [ ] Variables follow naming convention (camelCase, PascalCase, SCREAMING_SNAKE_CASE)
- [ ] Boolean variables have `is/has/should/can` prefix
- [ ] Explicit null checks for array/object access
- [ ] Using discriminated unions for complex state
- [ ] No unused variables or parameters (strict mode)
