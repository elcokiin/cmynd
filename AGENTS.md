**cmynd monorepo** combining React 19 + TanStack Start + Convex + Better-Auth

## Package Manager

**Bun** (not npm). Use `bun` for all commands.

```bash
bun install              # Install dependencies
bun run dev              # Start all apps in development mode
bun run dev:setup        # Setup Convex project (first time only)
bun run build            # Build all workspaces
bun run check-types      # Check TypeScript types across all apps
```

Web app runs at: [http://localhost:3001](http://localhost:3001)

---

## Monorepo Structure

```
cmynd/
├── apps/
│   ├── blog/                 # Blog app (TanStack Start)
│   ├── studio/              # Main studio app (React 19 + TanStack Start + TailwindCSS 4)
│   └── terminal-portfolio/  # Portfolio app
├── packages/
│   ├── backend/             # Convex backend with Better-Auth
│   ├── config/             # Shared TypeScript configs
│   ├── env/                # Shared environment variables
│   ├── errors/             # Shared error handling
│   └── ui/                 # Shared shadcn components
├── e2e/                    # End-to-end tests
├── skills/                 # Agent skills
└── turbo.json              # Turborepo configuration
```

---

## Workspace Dependencies

### Adding Dependencies
```bash
bun add <package>                      # Add to workspace root
bun add <package> --filter studio       # Add to specific workspace
bun add -d <package> --filter studio   # Add dev dependency
```

### Internal Packages
Use `workspace:*` for internal package references:
```json
{
  "dependencies": {
    "@elcokiin/ui": "workspace:*"
  }
}
```

### Catalog Packages
Use `catalog:` for version consistency across workspaces:
```json
{
  "dependencies": {
    "zod": "catalog:",
    "convex": "catalog:"
  }
}
```

**Current catalog packages:** dotenv, zod, typescript, convex, better-auth, @convex-dev/better-auth

---

## Development Commands

```bash
bun run dev:studio      # Start studio app only
bun run dev:portfolio   # Start portfolio app only
bun run dev:server      # Start Convex backend only
bun run dev:native      # Start native apps (if applicable)
```

---

## Guidelines

**Follow progressive disclosure:** Start with the essentials above. Consult specialized guides only when working in specific areas.

- **[TypeScript](typescript.md)** - Type system, imports, naming conventions
- **[React](react.md)** - Components, TanStack Form, hooks, state management
- **[Convex](convex.md)** - Backend patterns, queries, mutations, schema
- **[Styling](styling.md)** - TailwindCSS 4, CVA, design tokens, dark mode
- **[Security](security.md)** - Input validation (Zod), auth, data exposure
- **[Git](git.md)** - Conventional commits, atomic commits
- **[Checklist](checklist.md)** - Pre-commit verification

---

**Last Updated**: 2026-05-02
**Package Manager**: Bun 1.3.4
**Node Version**: Current LTS recommended