# elcokiin

A content management platform built with modern TypeScript technologies. Created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack).

## Tech Stack

- **TypeScript** - Type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **React 19** - UI library
- **TailwindCSS v4** - Utility-first CSS
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service
- **Better-Auth** - Authentication with Google OAuth
- **Turborepo** - Optimized monorepo build system
- **Bun** - Fast JavaScript runtime and package manager

## Project Structure

```
elcokiin/
├── apps/
│   └── studio/              # Main web application (React + TanStack Start)
├── packages/
│   ├── backend/             # Convex backend (schema, queries, mutations)
│   ├── ui/                  # Shared UI components (shadcn/ui)
│   ├── errors/              # Error codes and user-friendly messages
│   ├── env/                 # Type-safe environment variables
│   └── config/              # Shared TypeScript configuration
└── package.json             # Root workspace configuration
```

## Package Catalog

Shared dependency versions managed in root `package.json`:

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5 | TypeScript compiler |
| `convex` | ^1.31.2 | Backend-as-a-service |
| `better-auth` | 1.4.9 | Authentication |
| `@convex-dev/better-auth` | ^0.10.9 | Convex + Better Auth integration |
| `zod` | ^4.1.13 | Schema validation |
| `dotenv` | ^17.2.2 | Environment variable loading |

## Workspace Packages

| Package | Name | Description |
|---------|------|-------------|
| `apps/studio` | `studio` | Web application with editor and admin dashboard |
| `packages/backend` | `@elcokiin/backend` | Convex backend functions and schema |
| `packages/ui` | `@elcokiin/ui` | Shared UI component library |
| `packages/errors` | `@elcokiin/errors` | Error handling utilities |
| `packages/env` | `@elcokiin/env` | Environment variable validation |
| `packages/config` | `@elcokiin/config` | Shared TypeScript config |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.3.4 or later
- Node.js 18+ (for some tooling)

### Installation

```bash
bun install
```

### Convex Setup

Set up Convex backend (creates project and connects to cloud):

```bash
bun run dev:setup
```

Follow the prompts to create a new Convex project.

### Development

Start all applications in development mode:

```bash
bun run dev
```

Or start individual apps:

```bash
bun run dev:studio   # Start only the web studio
bun run dev:server   # Start only the Convex backend
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all applications |
| `bun run dev:studio` | Start only the web studio |
| `bun run dev:server` | Start only the Convex backend |
| `bun run dev:setup` | Setup and configure Convex project |
| `bun run check-types` | TypeScript type checking across all apps |

## Architecture

### Applications

- **Studio** (`apps/studio`): Main web application providing document editing, user dashboard, and admin functionality. Built with TanStack Start for SSR.

### Shared Packages

- **Backend** (`packages/backend`): Convex functions including document and author management, authentication, file storage, and email sending.

- **UI** (`packages/ui`): Reusable React components following shadcn/ui patterns. Includes buttons, dialogs, forms, navigation, and theme support.

- **Errors** (`packages/errors`): Centralized error handling with typed codes and user-friendly messages for consistent error reporting.

- **Env** (`packages/env`): Type-safe environment variable validation using @t3-oss/env-core and Zod schemas.

- **Config** (`packages/config`): Base TypeScript configuration extended by all packages for consistent compiler settings.

## Documentation

Each package has its own README with detailed documentation:

- [apps/studio/README.md](apps/studio/README.md) - Web application
- [packages/backend/README.md](packages/backend/README.md) - Backend package
- [packages/backend/convex/README.md](packages/backend/convex/README.md) - Convex functions
- [packages/ui/README.md](packages/ui/README.md) - UI components
- [packages/errors/README.md](packages/errors/README.md) - Error handling
- [packages/env/README.md](packages/env/README.md) - Environment variables
- [packages/config/README.md](packages/config/README.md) - TypeScript config

## Contributing

See `.ruler/` directory for coding guidelines:

- `typescript.md` - TypeScript conventions
- `react.md` - React patterns
- `convex.md` - Convex best practices
- `styling.md` - CSS/Tailwind guidelines
- `security.md` - Security practices
