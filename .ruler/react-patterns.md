# React & Component Patterns

## React Version
This project uses **React 19** with the latest features enabled.

## Component Structure

### Function Declarations
Use function declarations with named exports:

```typescript
// ✅ Good: function declaration with named export
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

// ❌ Bad: arrow function with default export
const Button = ({ className, variant, size, ...props }) => {
  return <ButtonPrimitive {...props} />;
};

export default Button;
```

### Component Props
Use `type` for component props:

```typescript
// ✅ Good: type for props
type ButtonProps = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
};

function Button({ variant = "default", size = "default", ...props }: ButtonProps) {
  // ...
}

// ⚠️ Acceptable: inline props
function Button({
  variant = "default",
  size = "default",
  disabled,
  children,
}: {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  // ...
}
```

### Component Size
- Keep components small and focused (< 200 lines)
- Extract logic into custom hooks
- Split complex components into smaller sub-components

## React Patterns

### TanStack Router
Use TanStack Router for navigation:

```typescript
// Route definition
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return <div>Dashboard</div>;
}

// Navigation
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

### TanStack Query
Use TanStack Query for data fetching:

```typescript
import { useQuery } from "@tanstack/react-query";
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

### Custom Hooks
Extract reusable logic into custom hooks:

```typescript
// ✅ Good: custom hook
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

### State Management
Prefer local state and server state over global state:

```typescript
// ✅ Good: local state for UI
function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// ✅ Good: server state with TanStack Query
function UserList() {
  const { data: users } = useConvexQuery(api.users.list, {});
  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

## Component Composition

### Compound Components
Use compound components for related UI:

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

// Usage
function UserCard() {
  return (
    <Card>
      <CardHeader>
        <h2>User Profile</h2>
      </CardHeader>
      <CardContent>
        <p>User details here</p>
      </CardContent>
    </Card>
  );
}
```

### Render Props Pattern
Use render props for flexible components:

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

// Usage
function UserList() {
  const { data: users = [] } = useConvexQuery(api.users.list, {});

  return (
    <DataList
      data={users}
      renderItem={(user) => <li key={user.id}>{user.name}</li>}
      renderEmpty={() => <div>No users found</div>}
    />
  );
}
```

## Performance Optimization

### Memoization
Use React 19's automatic memoization where applicable:

```typescript
// React 19 automatically optimizes these patterns
function ExpensiveComponent({ data }: { data: ComplexData }) {
  const processedData = useMemo(() => {
    return data.items.map(item => expensiveOperation(item));
  }, [data.items]);

  return <div>{processedData.length} items</div>;
}
```

### Code Splitting
Use `React.lazy()` for route-based code splitting:

```typescript
import { lazy } from "react";

const Dashboard = lazy(() => import("./routes/dashboard"));
const Profile = lazy(() => import("./routes/profile"));

// TanStack Router handles suspense automatically
export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});
```

## Best Practices

### Avoid Prop Drilling
Use context or composition to avoid deep prop drilling:

```typescript
// ✅ Good: context for global state
import { createContext, useContext } from "react";

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

### Keep JSX Simple
Extract complex logic out of JSX:

```typescript
// ✅ Good: logic extracted
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

// ❌ Bad: complex logic in JSX
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

### Forms with TanStack Form

This project uses **TanStack Form** (`@tanstack/react-form`) for form management. Follow these principles:

#### Philosophy

1. **No Generics**: Never pass generics to `useForm`. Let TypeScript infer types from `defaultValues`.
2. **Controlled Inputs**: All forms use controlled inputs for predictability, testing, and debugging.
3. **Flexible Validation**: Support multiple validation strategies (on blur, change, submit, mount).
4. **Validation Libraries**: Use Zod or Valibot for validation schemas.
5. **Wrap into Components**: Create reusable form components and hooks for your design system.

#### Basic Form Pattern

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

// ✅ Good: Infer types from defaultValues, no generics
function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // Handle login with fully typed values
      console.log(value.email, value.password);
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

// ❌ Bad: using generics
interface LoginFormValues {
  email: string;
  password: string;
}

function BadLoginForm() {
  const form = useForm<LoginFormValues>({  // ❌ Don't use generics
    // ...
  });
}
```

#### Type-Safe Forms with Zod

```typescript
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

// Define schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
  bio: z.string().optional(),
});

type User = z.infer<typeof userSchema>;

// ✅ Good: Type-safe with inference
function UserForm() {
  const defaultUser: User = {
    name: "",
    email: "",
    age: 18,
    bio: "",
  };

  const form = useForm({
    defaultValues: defaultUser,
    onSubmit: async ({ value }) => {
      // value is fully typed as User
      await saveUser(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: userSchema.shape.name,
        }}
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

      <form.Field
        name="email"
        validators={{
          onChange: userSchema.shape.email,
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <label>Email</label>
            <input
              type="email"
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

#### Async Validation with Debouncing

```typescript
function SignupForm() {
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      await createUser(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
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
    </form>
  );
}
```

#### Custom Form Components (Recommended)

Create reusable form components for consistency:

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

// Usage with custom component
function LoginForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field
        name="email"
        validators={{
          onChange: z.string().email(),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => <TextField field={field} label="Email" type="email" />}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: z.string().min(8),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => <TextField field={field} label="Password" type="password" />}
      </form.Field>

      <button type="submit">Login</button>
    </form>
  );
}
```

#### Conditional Fields

```typescript
function ProfileForm() {
  const form = useForm({
    defaultValues: {
      userType: "individual" as "individual" | "business",
      name: "",
      companyName: "",
      taxId: "",
    },
    onSubmit: async ({ value }) => {
      await updateProfile(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field name="userType">
        {(field) => (
          <div>
            <label>User Type</label>
            <select
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as any)}
            >
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="name">
        {(field) => (
          <div>
            <label>Name</label>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      {/* Conditional fields based on userType */}
      <form.Subscribe
        selector={(state) => state.values.userType}
      >
        {(userType) => (
          userType === "business" && (
            <>
              <form.Field name="companyName">
                {(field) => (
                  <div>
                    <label>Company Name</label>
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="taxId">
                {(field) => (
                  <div>
                    <label>Tax ID</label>
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </>
          )
        )}
      </form.Subscribe>

      <button type="submit">Save Profile</button>
    </form>
  );
}
```

#### Form Validation Timing

TanStack Form supports multiple validation triggers:

```typescript
function FlexibleForm() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await register(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Validate on change */}
      <form.Field
        name="email"
        validators={{
          onChange: z.string().email("Invalid email"),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((e) => <span key={e}>{e}</span>)}
          </div>
        )}
      </form.Field>

      {/* Validate on blur */}
      <form.Field
        name="password"
        validators={{
          onBlur: z.string().min(8, "Password must be at least 8 characters"),
        }}
        validatorAdapter={zodValidator()}
      >
        {(field) => (
          <div>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.map((e) => <span key={e}>{e}</span>)}
          </div>
        )}
      </form.Field>

      {/* Cross-field validation on submit */}
      <form.Field
        name="confirmPassword"
        validators={{
          onSubmit: ({ value, fieldApi }) => {
            const password = fieldApi.form.getFieldValue("password");
            return value === password ? undefined : "Passwords must match";
          },
        }}
      >
        {(field) => (
          <div>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((e) => <span key={e}>{e}</span>)}
          </div>
        )}
      </form.Field>

      <button type="submit">Register</button>
    </form>
  );
}
```

#### Best Practices

1. **Never use generics** - let TypeScript infer from `defaultValues`
2. **Always define `defaultValues`** - ensures type safety without generics
3. **Use Zod for validation** - consistent with project's validation strategy
4. **Create reusable field components** - wrap form fields into your design system
5. **Leverage controlled inputs** - predictable state, easier testing, better debugging
6. **Use appropriate validation timing** - `onChange` for instant feedback, `onBlur` for expensive checks
7. **Debounce async validation** - use `onChangeAsyncDebounceMs` for API calls
8. **Handle form state** - use `form.state.isSubmitting`, `form.state.canSubmit` for UX
