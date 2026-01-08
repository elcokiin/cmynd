# AI Agent React Patterns

**Audience**: This document defines React component patterns for AI agents. Follow these rules when creating or modifying React components.

---

## Project Configuration
- **React Version**: React 19
- **Router**: TanStack Router
- **Data Fetching**: TanStack Query + Convex
- **Forms**: TanStack Form
- **Styling**: TailwindCSS 4

---

## Component Structure (MANDATORY)

### Rule 1: Use Function Declarations with Named Exports
**Never use arrow functions or default exports for components.**

**Correct:**
```typescript
import type { VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**Incorrect:**
```typescript
// Arrow function with default export
const Button = ({ className, variant, size, ...props }) => {
  return <ButtonPrimitive {...props} />;
};

export default Button;
```

### Rule 2: Use `type` for Component Props
Define props using `type` (not `interface`).

**Correct:**
```typescript
type ButtonProps = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
};

function Button({ variant = "default", size = "default", ...props }: ButtonProps) {
  // Implementation
}
```

### Rule 3: Keep Components Under 200 Lines
If a component exceeds 200 lines:
1. Extract logic into custom hooks
2. Split into smaller sub-components
3. Move helper functions to separate files

---

## Navigation (TanStack Router)

### Route Definition
```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return <div>Dashboard</div>;
}
```

### Navigation Patterns
```typescript
import { Link, useNavigate } from "@tanstack/react-router";

function Navigation() {
  const navigate = useNavigate();

  return (
    <>
      <Link to="/dashboard">Dashboard</Link>
      <button onClick={() => navigate({ to: "/profile" })}>
        Go to Profile
      </button>
    </>
  );
}
```

---

## Data Fetching (TanStack Query + Convex)

**You MUST use `useConvexQuery` for all Convex data fetching.**

```typescript
import { useConvexQuery } from "@convex-dev/react-query";
import { api } from "@elcokiin/backend";

function UserProfile() {
  const { data: user, isLoading } = useConvexQuery(
    api.users.getCurrentUser,
    {}
  );

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}
```

---

## Custom Hooks

Extract reusable component logic into custom hooks prefixed with `use`.

**Example:**
```typescript
function useAuth() {
  const { data: session, isLoading } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await authClient.signOut();
    navigate({ to: "/" });
  };

  return {
    user: session?.user,
    isLoading,
    isAuthenticated: !!session,
    signOut,
  };
}

// Usage
function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div>
      <span>{user.name}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## State Management

**Priority Order:**
1. **Local state** (`useState`) for UI-only state (modals, toggles, inputs)
2. **Server state** (`useConvexQuery`) for data from backend
3. **Context** for deeply nested shared state (themes, auth)
4. **Avoid global state managers** (Redux, Zustand) unless absolutely necessary

**Examples:**
```typescript
// Local state for UI
function SearchInput() {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Server state with Convex
function UserList() {
  const { data: users } = useConvexQuery(api.users.list);
  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## Component Composition

### Compound Components
Use for related UI elements that work together:

```typescript
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border", className)}>{children}</div>;
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4 pt-0", className)}>{children}</div>;
}

export { Card, CardHeader, CardContent };
```

### Render Props Pattern
Use for flexible, reusable list components:

```typescript
type DataListProps<T> = {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
};

function DataList<T>({ data, renderItem, renderEmpty }: DataListProps<T>) {
  if (data.length === 0) {
    return renderEmpty?.() ?? <div>No items</div>;
  }

  return <ul>{data.map(renderItem)}</ul>;
}
```

---

## Performance

### Use `useMemo` for Expensive Calculations
```typescript
function ExpensiveComponent({ data }: { data: ComplexData }) {
  const processedData = useMemo(() => {
    return data.items.map(item => expensiveOperation(item));
  }, [data.items]);

  return <div>{processedData.length} items</div>;
}
```

### Use `React.lazy()` for Code Splitting
```typescript
import { lazy } from "react";

const Dashboard = lazy(() => import("./routes/dashboard"));

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});
```

---

## JSX Best Practices

### Rule: Extract Complex Logic from JSX
**Never write complex conditionals or filtering directly in JSX.**

**Correct:**
```typescript
function UserList() {
  const { data: users = [] } = useConvexQuery(api.users.list, {});
  const activeUsers = users.filter(u => u.status === "active");
  const hasActiveUsers = activeUsers.length > 0;

  if (!hasActiveUsers) {
    return <div>No active users</div>;
  }

  return (
    <ul>
      {activeUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**Incorrect:**
```typescript
function UserList() {
  const { data: users = [] } = useConvexQuery(api.users.list, {});

  return (
    <ul>
      {users.filter(u => u.status === "active").length > 0
        ? users.filter(u => u.status === "active").map(user => (
            <li key={user.id}>{user.name}</li>
          ))
        : <div>No active users</div>}
    </ul>
  );
}
```

### Rule: Avoid Prop Drilling
Use Context for deeply nested state:

```typescript
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

function useTheme() {
  return useContext(ThemeContext);
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeContext.Provider value={theme}>
      <Dashboard />
    </ThemeContext.Provider>
  );
}
```

---

## Forms with TanStack Form (MANDATORY PATTERNS)

This project uses **TanStack Form** (`@tanstack/react-form`).

### Core Rules

1. **NEVER use generics with `useForm`** - let TypeScript infer types from `defaultValues`
2. **ALWAYS use controlled inputs** - no uncontrolled form elements
3. **ALWAYS validate with Zod** - use `zodValidator()` adapter
4. **ALWAYS define `defaultValues`** - required for type inference
5. **Create reusable field components** - wrap repetitive field patterns

### Basic Form Pattern

**Correct:**
```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // value is fully typed from defaultValues
      await login(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: z.string().email("Invalid email"),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <span>{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: z.string().min(8, "Password must be at least 8 characters"),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Password</label>
            <input
              id={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <span>{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>

      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

**Incorrect:**
```typescript
interface LoginFormValues {
  email: string;
  password: string;
}

function BadLoginForm() {
  const form = useForm<LoginFormValues>({  // NEVER use generics
    // ...
  });
}
```

### Type-Safe Forms with Zod Schema

```typescript
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
});

type User = z.infer<typeof userSchema>;

function UserForm() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      age: 18,
    } satisfies User,
    onSubmit: async ({ value }) => {
      await saveUser(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field
        name="name"
        validators={{ onChange: userSchema.shape.name }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <label>Name</label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((error) => (
              <span key={error}>{error}</span>
            ))}
          </div>
        )}
      </form.Field>

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Async Validation with Debouncing

Use `onChangeAsyncDebounceMs` for expensive validation (e.g., checking username availability):

```typescript
<form.Field
  name="username"
  validators={{
    onChangeAsync: z.string().min(3),
    onChangeAsyncDebounceMs: 500,
  }}
  validatorAdapter={zodValidator()}
  asyncAlways
>
  {(field) => (
    <div>
      <label>Username</label>
      <input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isValidating && <span>Checking...</span>}
      {field.state.meta.errors.map((error) => (
        <span key={error}>{error}</span>
      ))}
    </div>
  )}
</form.Field>
```

### Reusable Field Components (RECOMMENDED)

**You should create reusable field components** to reduce boilerplate:

```typescript
// components/forms/TextField.tsx
import type { FieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TextFieldProps = {
  field: FieldApi<any, any, any, any>;
  label: string;
  type?: "text" | "email" | "password" | "number";
};

export function TextField({ field, label, type = "text" }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        type={type}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  );
}

// Usage
function LoginForm() {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => await login(value),
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field
        name="email"
        validators={{ onChange: z.string().email() }}
        validatorAdapter={zodValidator()}
      >
        {(field) => <TextField field={field} label="Email" type="email" />}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: z.string().min(8) }}
        validatorAdapter={zodValidator()}
      >
        {(field) => <TextField field={field} label="Password" type="password" />}
      </form.Field>

      <button type="submit">Login</button>
    </form>
  );
}
```

### Conditional Fields

Use `form.Subscribe` to show/hide fields based on other field values:

```typescript
<form.Subscribe selector={(state) => state.values.userType}>
  {(userType) => (
    userType === "business" && (
      <>
        <form.Field name="companyName">
          {(field) => <TextField field={field} label="Company Name" />}
        </form.Field>
        <form.Field name="taxId">
          {(field) => <TextField field={field} label="Tax ID" />}
        </form.Field>
      </>
    )
  )}
</form.Subscribe>
```

### Validation Timing

Choose appropriate validation strategy:
- **`onChange`**: Instant feedback (email format, required fields)
- **`onBlur`**: After user leaves field (password strength)
- **`onSubmit`**: Cross-field validation (password confirmation)
- **`onChangeAsync`**: API calls (username availability)

```typescript
// Instant validation
<form.Field
  name="email"
  validators={{ onChange: z.string().email("Invalid email") }}
  validatorAdapter={zodValidator()}
>
  {(field) => /* ... */}
</form.Field>

// Blur validation
<form.Field
  name="password"
  validators={{ onBlur: z.string().min(8) }}
  validatorAdapter={zodValidator()}
>
  {(field) => /* ... */}
</form.Field>

// Cross-field validation
<form.Field
  name="confirmPassword"
  validators={{
    onSubmit: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue("password");
      return value === password ? undefined : "Passwords must match";
    },
  }}
>
  {(field) => /* ... */}
</form.Field>
```

---

## Form Checklist

Before submitting a form implementation, verify:

- [ ] No generics passed to `useForm`
- [ ] `defaultValues` are defined
- [ ] All fields use controlled inputs
- [ ] Zod validation on all fields
- [ ] Error messages are displayed
- [ ] Submit button shows loading state (`form.state.isSubmitting`)
- [ ] Form prevents default submit behavior
- [ ] Reusable field components created for repeated patterns
