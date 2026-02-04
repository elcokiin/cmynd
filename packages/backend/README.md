# @elcokiin/backend

Convex backend package containing database schema, functions, and shared backend utilities.

## Overview

This package provides the backend infrastructure for the elcokiin platform using [Convex](https://convex.dev), a reactive backend-as-a-service. It includes database schema definitions, queries, mutations, and authentication via Better Auth.

## Structure

```
packages/backend/
├── convex/                 # Convex functions and schema
│   ├── _lib/               # Shared internal utilities (not exported to API)
│   ├── _generated/         # Auto-generated Convex files (do not edit)
│   ├── authors/            # Author queries and mutations
│   ├── documents/          # Document queries, mutations, and helpers
│   ├── email/              # Email templates and sending (Resend)
│   ├── auth.ts             # Better-Auth setup
│   ├── auth.config.ts      # Better-Auth configuration
│   ├── healthCheck.ts      # Health check endpoint
│   ├── http.ts             # HTTP router
│   ├── schema.ts           # Database schema definitions
│   └── storage.ts          # File storage mutations
├── lib/
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Utility functions (slug, title)
│   └── validators/         # Zod validators for auth, documents, authors
└── package.json
```

## Exports

```typescript
// API access
import { api } from "@elcokiin/backend/convex/_generated/api";

// Types
import type { DocumentType } from "@elcokiin/backend/lib/types";
import type { DocumentListItem } from "@elcokiin/backend/lib/types/documents";

// Validators
import { documentTypeValidator } from "@elcokiin/backend/lib/validators/documents";
import { signUpValidator } from "@elcokiin/backend/lib/validators/auth";
```

## Scripts

```bash
bun run dev          # Start Convex dev server
bun run dev:setup    # Configure Convex project
bun run test         # Run tests
bun run test:watch   # Run tests in watch mode
bun run check-types  # TypeScript type checking
```

## Dependencies

- **convex** - Backend-as-a-service
- **better-auth** - Authentication
- **@convex-dev/better-auth** - Convex + Better Auth integration
- **@convex-dev/resend** - Email via Resend
- **zod** - Schema validation
- **slug** - URL slug generation

## Environment Variables

See `packages/backend/.env.example` for required environment variables.

## Documentation

See `convex/README.md` for detailed Convex function documentation and architecture guidelines.
