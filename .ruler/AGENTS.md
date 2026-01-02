# AI Agent Instructions for elcokiin

## Project Overview

This is a **Better-T-Stack monorepo** combining modern web technologies:

- **Frontend**: React 19 + TanStack Start (SSR) + TailwindCSS 4 + shadcn/ui
- **Backend**: Convex (reactive backend-as-a-service)
- **Auth**: Better-Auth with Convex integration
- **Build System**: Turborepo + Bun package manager
- **TypeScript**: Strict mode enabled across all packages

## Quick Start

```bash
bun install              # Install dependencies
bun run dev:setup        # Setup Convex project (first time only)
bun run dev              # Start all apps in development mode
```

Open [http://localhost:3001](http://localhost:3001) to view the web app.

## Essential Commands

### Development
```bash
bun run dev              # Start all apps in development mode
bun run dev:web          # Start only the web app (port 3001)
bun run dev:server       # Start only the Convex backend
bun run dev:setup        # Setup and configure Convex project
```

### Build & Type Checking
```bash
bun run build            # Build all workspaces
bun run check-types      # Check TypeScript types across all apps
```

### Testing
Currently no test suite configured. When adding tests:
- Use Vitest for unit/integration tests (already has @testing-library/react)
- Test file naming: `*.test.ts`, `*.test.tsx`
- Run single test: `bun test <file-path>` (after setting up Vitest)

### Ruler
```bash
bun run ruler:apply      # Apply ruler configuration (--local-only flag set)
```

## Monorepo Structure

```
elcokiin/
├── apps/
│   └── web/              # Frontend application
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities, auth clients
│       │   ├── routes/      # TanStack Router routes
│       │   └── index.css    # Global styles
│       └── vite.config.ts
├── packages/
│   ├── backend/          # Convex backend
│   │   └── convex/       # Convex functions, schema, auth config
│   ├── config/           # Shared TypeScript configs
│   └── env/              # Shared environment variables
└── turbo.json            # Turborepo configuration
```

## Dependencies Management

### Adding Dependencies
```bash
# Add to workspace root
bun add <package>

# Add to specific workspace
bun add <package> --filter web
bun add <package> --filter @elcokiin/backend

# Add dev dependency
bun add -d <package> --filter web
```

### Workspace Dependencies
- Use `workspace:*` for internal package references
- Use catalog for version consistency: `"zod": "catalog:"`
- Current catalog packages: dotenv, zod, typescript, convex, better-auth, @convex-dev/better-auth

**Example** (in `package.json`):
```json
{
  "dependencies": {
    "zod": "catalog:",
    "@elcokiin/env": "workspace:*"
  }
}
```

## Environment Variables

- Store in `.env` files (gitignored)
- Use `@elcokiin/env` package for type-safe env access
- Never commit `.env` files
- Document required env vars in `.env.example`

## Authentication

- Better-Auth integrated with Convex
- Client: `authClient` from `@/lib/auth-client`
- Server: Auth config in `packages/backend/convex/auth.config.ts`
- Always use Convex's auth integration: `@convex-dev/better-auth`

---

**Last Updated**: 2025-12-29  
**Package Manager**: Bun 1.3.4  
**Node Version**: Current LTS recommended
