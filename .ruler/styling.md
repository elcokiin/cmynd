# AI Agent Styling Guidelines

**Audience**: This document defines styling patterns for AI agents working with TailwindCSS and shadcn/ui.

---

## Tech Stack
- **TailwindCSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **class-variance-authority (cva)** - Component variants
- **tw-animate-css** - Animation utilities

---

## Rule 1: ALWAYS Use `cn()` for className Management
**Never use string concatenation or template literals for classNames.**

**Correct:**
```typescript
import { cn } from "@/lib/utils";

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
```

**Incorrect:**
```typescript
// String concatenation
className={"px-4 py-2 " + (isActive ? "bg-blue-500" : "bg-gray-200")}

// Template literals
className={`px-4 py-2 ${isActive ? "bg-blue-500" : "bg-gray-200"}`}
```

---

## Rule 2: Use CVA for Component Variants
**When a component has 2+ style variants, use class-variance-authority (cva).**

**Pattern:**
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

### Compound Variants (Advanced)
Use when styles depend on multiple variant combinations:

```typescript
compoundVariants: [
  {
    variant: "default",
    size: "lg",
    className: "font-semibold",
  },
],
```

---

## Rule 3: Utility-First Approach
**ALWAYS prefer Tailwind utilities over custom CSS classes.**

**Correct:**
```typescript
function Card() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Title</h2>
      <p className="mt-2 text-muted-foreground">Description</p>
    </div>
  );
}
```

**Incorrect:**
```typescript
// Custom CSS classes
<div className="custom-card">
  <h2 className="custom-title">Title</h2>
</div>
```

---

## Rule 4: Mobile-First Responsive Design
**Use Tailwind responsive prefixes in order: sm → md → lg → xl → 2xl**

**Examples:**
```typescript
// Grid layout: mobile (1 col) → tablet (2 col) → desktop (3 col)
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>

// Typography: progressively larger on bigger screens
<h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
  Responsive Heading
</h1>
```

---

## Rule 5: ALWAYS Include Dark Mode Support
**Use `dark:` prefix for all background, text, and border colors.**

**Correct:**
```typescript
function Card() {
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
      <p className="text-gray-600 dark:text-gray-400">Description</p>
    </div>
  );
}
```

---

## Rule 6: Use Design Tokens (Semantic Colors)
**Prefer semantic tokens over hardcoded colors for theme consistency.**

**Available Design Tokens:**
- **Colors**: `primary`, `secondary`, `accent`, `muted`, `destructive`
- **Text**: `foreground`, `muted-foreground`, `primary-foreground`
- **Background**: `background`, `card`, `popover`
- **Border**: `border`, `input`, `ring`

**Correct:**
```typescript
function Alert() {
  return (
    <div className="border-border bg-background text-foreground">
      <p className="text-muted-foreground">Info message</p>
    </div>
  );
}
```

**Incorrect:**
```typescript
// Hardcoded colors
<div className="border-gray-200 bg-white text-black">
  <p className="text-gray-500">Info message</p>
</div>
```

---

## Layout Patterns

### Flexbox (Common Patterns)

```jsx
// Horizontal with gap
<div className="flex items-center gap-2">
  <Icon />
  <span>Label</span>
</div>

// Vertical stack
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

### Grid (Complex Layouts)

```jsx
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

---

## Animations & Transitions

### Tailwind Transitions

**Common patterns:**
```jsx
// Color transitions (most common)
<button className="transition-colors duration-200 hover:bg-primary">

// All properties
<button className="transition-all duration-300 hover:scale-105 hover:shadow-lg">

// Duration options: duration-150 (fast), duration-200 (normal), duration-300 (slow)
```

### tw-animate-css (Complex Animations)
```typescript
import "tw-animate-css";

<div className="animate-fadeIn animate-duration-500">
  <Card />
</div>

// Available: animate-fadeIn, animate-fadeOut, animate-slideInUp, animate-bounceIn
```

---

## Spacing & Accessibility

### Consistent Spacing Scale
**Use Tailwind's spacing scale consistently: 0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32**

```jsx
<div className="space-y-4">  {/* 1rem = 16px */}
  <Section />
</div>

<div className="p-6">        {/* 1.5rem = 24px */}
  <Content />
</div>

<div className="mb-8">       {/* 2rem = 32px */}
  <Header />
</div>
```

### Focus States (MANDATORY for Accessibility)
**You MUST include focus states for all interactive elements.**

**Patterns:**
```jsx
// All focus (mouse + keyboard)
<input className="focus:outline-none focus:ring-2 focus:ring-primary" />

// Keyboard-only focus (recommended for buttons)
<button className="focus-visible:ring-2 focus-visible:ring-offset-2">
  Click me
</button>
```

---

## Anti-Patterns (FORBIDDEN)

### ❌ Magic Numbers (Arbitrary Values)
```jsx
// INCORRECT
<div className="w-[347px] h-[234px]" />

// CORRECT
<div className="w-80 h-64" />
```

### ❌ Inline Styles
```jsx
// INCORRECT
<div style={{ marginTop: "20px", color: "red" }} />

// CORRECT
<div className="mt-5 text-red-500" />
```

### ❌ Using !important
```jsx
// INCORRECT
<div className="!mt-10" />

// CORRECT - Fix specificity properly
<div className="mt-10" />
```

---

## Custom CSS (Last Resort Only)

**Only write custom CSS when Tailwind utilities are truly insufficient** (e.g., browser-specific pseudo-elements):

```css
/* apps/studio/src/index.css */
@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-gray-300 dark:bg-gray-700;
  }
}
```

---

## Styling Checklist

Before submitting styled components, verify:

- [ ] All classNames use `cn()` utility
- [ ] Components with 2+ variants use CVA
- [ ] No custom CSS classes (use Tailwind utilities)
- [ ] Mobile-first responsive design (sm → md → lg → xl → 2xl)
- [ ] Dark mode support included (`dark:` prefix)
- [ ] Semantic design tokens used (not hardcoded colors)
- [ ] Focus states on all interactive elements
- [ ] Consistent spacing scale used
- [ ] No magic numbers or arbitrary values
- [ ] No inline styles
- [ ] No `!important` modifiers
