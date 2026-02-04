# Studio

Web application for the elcokiin content management platform.

## Overview

Studio is the main frontend application built with React 19, TanStack Start (SSR framework), and TanStack Router. It provides a rich document editing experience with a Novel/Tiptap-based editor, authentication, and an admin dashboard.

## Structure

```
apps/studio/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── dashboard/      # User dashboard components
│   │   ├── editor/         # Document editor components
│   │   └── layout/         # Layout components (sidebar, etc.)
│   ├── config/             # App configuration
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── routes/             # TanStack Router routes
│   │   ├── _auth/          # Authenticated routes
│   │   │   ├── admin/      # Admin routes
│   │   │   └── editor/     # Editor routes
│   │   └── api/            # API routes
│   └── utils/              # Utility functions
└── package.json
```

## Features

- **Document Editor**: Rich text editing with Novel/Tiptap
- **Authentication**: Better Auth with Google OAuth
- **Dashboard**: Document list with filtering and pagination
- **Admin Panel**: Content review and moderation
- **Responsive Design**: Mobile-friendly sidebar navigation
- **Dark Mode**: Theme toggle support

## Routes

| Route | Description |
|-------|-------------|
| `/` | User dashboard (authenticated) |
| `/editor/new` | Create new document |
| `/editor/:slug` | Edit existing document |
| `/admin` | Admin dashboard |
| `/admin/review/:slug` | Review document |

## Key Components

- **AdvancedEditor**: Tiptap-based rich text editor
- **AppSidebar**: Main navigation sidebar
- **DocumentCard**: Document list item
- **DocumentSettingsDialog**: Document metadata editor
- **ReviewPageLayout**: Admin review interface

## Scripts

```bash
bun run dev    # Start development server
bun run build  # Build for production
bun run serve  # Preview production build
```

## Dependencies

- **React 19** - UI library
- **TanStack Start** - SSR framework
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching
- **Convex** - Real-time backend
- **Novel/Tiptap** - Rich text editor
- **Better Auth** - Authentication
- **Tailwind CSS** - Styling

## Environment Variables

See `@elcokiin/env` package for required environment variables:
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

## Development

```bash
# From monorepo root
bun run dev:studio

# Or run all apps
bun run dev
```

The app runs at [http://localhost:3001](http://localhost:3001) by default.
