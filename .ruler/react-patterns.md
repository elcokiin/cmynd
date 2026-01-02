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

### Prefer Controlled Components
Use controlled components for forms:

```typescript
// ✅ Good: controlled input
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```
