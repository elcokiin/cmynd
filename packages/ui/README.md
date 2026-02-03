# @elcokiin/ui

Shared UI component library built with shadcn/ui, Tailwind CSS, and React.

## Overview

This package provides reusable UI components following the shadcn/ui design system. Components are built with React 19, styled with Tailwind CSS v4, and use Radix UI primitives via Base UI for accessibility.

## Structure

```
packages/ui/
├── src/
│   ├── components/         # UI components
│   │   ├── alert-dialog.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── tooltip.tsx
│   ├── lib/
│   │   └── utils.ts        # Utility functions (cn)
│   └── styles/
│       └── global.css      # Global styles
├── components.json         # shadcn/ui configuration
└── package.json
```

## Usage

Import components individually:

```typescript
import { Button } from "@elcokiin/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@elcokiin/ui/card";
import { Input } from "@elcokiin/ui/input";
import { cn } from "@elcokiin/ui/lib/utils";

// Import global styles in your app
import "@elcokiin/ui/styles";
```

## Available Components

| Component | Description |
|-----------|-------------|
| `alert-dialog` | Modal dialog for confirmations |
| `breadcrumb` | Navigation breadcrumbs |
| `button` | Button with variants |
| `card` | Card container |
| `checkbox` | Checkbox input |
| `command` | Command palette (cmdk) |
| `dialog` | Modal dialog |
| `dropdown-menu` | Dropdown menu |
| `input` | Text input |
| `label` | Form label |
| `pagination` | Pagination controls |
| `popover` | Popover overlay |
| `separator` | Visual separator |
| `sheet` | Slide-out panel |
| `sidebar` | Collapsible sidebar |
| `skeleton` | Loading skeleton |
| `sonner` | Toast notifications |
| `theme-provider` | Theme context provider |
| `theme-toggle` | Dark/light mode toggle |
| `tooltip` | Tooltip overlay |

## Dependencies

- **React 19** - UI library
- **Tailwind CSS v4** - Styling
- **@base-ui/react** - Radix primitives
- **class-variance-authority** - Variant styling
- **lucide-react** - Icons
- **next-themes** - Theme management
- **cmdk** - Command palette
- **sonner** - Toast notifications

## Scripts

```bash
bun run lint         # Run ESLint
bun run check-types  # TypeScript type checking
```
