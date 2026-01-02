# Styling Guidelines

## Tech Stack
- **TailwindCSS 4** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **class-variance-authority (cva)** - Component variants
- **tw-animate-css** - Animation utilities

## Core Utilities

### The `cn()` Function
Always use `cn()` for conditional className management:

```typescript
import { cn } from "@/lib/utils";

// ✅ Good: using cn() for conditional classes
function Button({ className, isActive }: { className?: string; isActive: boolean }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded",
        isActive && "bg-blue-500 text-white",
        !isActive && "bg-gray-200 text-gray-800",
        className
      )}
    >
      Click me
    </button>
  );
}

// ❌ Bad: string concatenation
function Button({ className, isActive }) {
  return (
    <button
      className={
        "px-4 py-2 rounded " +
        (isActive ? "bg-blue-500 text-white " : "bg-gray-200 text-gray-800 ") +
        (className || "")
      }
    >
      Click me
    </button>
  );
}
```

## Component Variants with CVA

### Basic CVA Usage
Use `cva` for components with multiple variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base styles (always applied)
  "inline-flex items-center justify-center transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 text-destructive",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2",
        lg: "h-9 px-3",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Compound Variants
Use compound variants for interdependent styles:

```typescript
const badgeVariants = cva("inline-flex items-center", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    },
    size: {
      default: "px-2 py-1 text-xs",
      lg: "px-3 py-1.5 text-sm",
    },
    rounded: {
      true: "rounded-full",
      false: "rounded",
    },
  },
  compoundVariants: [
    {
      variant: "default",
      size: "lg",
      className: "font-semibold",
    },
  ],
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: false,
  },
});
```

## TailwindCSS Best Practices

### Utility-First Approach
Prefer Tailwind utilities over custom CSS:

```typescript
// ✅ Good: Tailwind utilities
function Card() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Title</h2>
      <p className="mt-2 text-muted-foreground">Description</p>
    </div>
  );
}

// ❌ Bad: custom CSS
function Card() {
  return (
    <div className="custom-card">
      <h2 className="custom-title">Title</h2>
      <p className="custom-description">Description</p>
    </div>
  );
}
```

### Responsive Design
Use responsive modifiers consistently:

```typescript
// ✅ Good: mobile-first responsive design
function Hero() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card />
      <Card />
      <Card />
    </div>
  );
}

// Order of breakpoints: sm -> md -> lg -> xl -> 2xl
function ResponsiveText() {
  return (
    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
      Responsive Heading
    </h1>
  );
}
```

### Dark Mode Support
Use dark mode utilities with `dark:` prefix:

```typescript
// ✅ Good: dark mode support
function Card() {
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
      <p className="text-gray-600 dark:text-gray-400">Description</p>
    </div>
  );
}
```

### Design Tokens
Use Tailwind's design tokens (from theme):

```typescript
// ✅ Good: using design tokens
function Alert() {
  return (
    <div className="border-border bg-background text-foreground">
      <p className="text-muted-foreground">Info message</p>
    </div>
  );
}

// Design tokens available:
// - Colors: primary, secondary, accent, muted, destructive
// - Text: foreground, muted-foreground, primary-foreground
// - Background: background, card, popover
// - Border: border, input, ring
```

## Layout Patterns

### Flexbox
Use flexbox for common layouts:

```typescript
// Horizontal layout with gap
<div className="flex items-center gap-2">
  <Icon />
  <span>Label</span>
</div>

// Vertical layout
<div className="flex flex-col gap-4">
  <Item />
  <Item />
</div>

// Space between
<div className="flex items-center justify-between">
  <Logo />
  <Navigation />
</div>

// Center content
<div className="flex h-screen items-center justify-center">
  <LoginForm />
</div>
```

### Grid
Use grid for complex layouts:

```typescript
// Auto-fit responsive grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Card />
  <Card />
  <Card />
</div>

// Fixed columns with responsive breakpoints
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>
```

## Animations

### Transition Utilities
Use Tailwind's transition utilities:

```typescript
// ✅ Good: smooth transitions
function Button() {
  return (
    <button className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
      Hover me
    </button>
  );
}

// Common transitions:
// - transition-colors: for color changes
// - transition-all: for all properties
// - duration-200: 200ms (fast)
// - duration-300: 300ms (normal)
```

### tw-animate-css
Use `tw-animate-css` for complex animations:

```typescript
import "tw-animate-css";

function AnimatedCard() {
  return (
    <div className="animate-fadeIn animate-duration-500">
      <Card />
    </div>
  );
}

// Available animations:
// - animate-fadeIn, animate-fadeOut
// - animate-slideInUp, animate-slideInDown
// - animate-bounceIn, animate-pulse
```

## Common Patterns

### shadcn/ui Components
Follow shadcn/ui patterns for consistency:

```typescript
// ✅ Good: shadcn/ui pattern
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <h2>Dashboard</h2>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Consistent Spacing
Use consistent spacing scale:

```typescript
// Spacing scale: 0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32

// ✅ Good: consistent spacing
<div className="space-y-4">      {/* 1rem = 16px */}
  <Section />
  <Section />
</div>

<div className="p-6">            {/* 1.5rem = 24px */}
  <Content />
</div>

<div className="mb-8">           {/* 2rem = 32px */}
  <Header />
</div>
```

### Focus States
Always include focus states for accessibility:

```typescript
// ✅ Good: visible focus state
function Input() {
  return (
    <input
      className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

// ✅ Good: focus-visible for keyboard-only
function Button() {
  return (
    <button className="rounded px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2">
      Click me
    </button>
  );
}
```

## Anti-Patterns to Avoid

```typescript
// ❌ Bad: magic numbers
<div className="w-[347px] h-[234px]" />

// ✅ Good: use design system values
<div className="w-80 h-64" />

// ❌ Bad: inline styles
<div style={{ marginTop: "20px", color: "red" }} />

// ✅ Good: Tailwind classes
<div className="mt-5 text-red-500" />

// ❌ Bad: !important via Tailwind
<div className="!mt-10" />

// ✅ Good: fix specificity issues properly
<div className="mt-10" /> {/* Ensure proper cascade */}
```

## Custom Styles (When Necessary)

Only use custom CSS when Tailwind utilities are insufficient:

```css
/* apps/web/src/index.css */
@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-gray-300 dark:bg-gray-700;
  }
}
```
