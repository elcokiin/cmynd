# @elcokiin/env

Type-safe environment variable validation using @t3-oss/env-core and Zod.

## Overview

This package provides centralized, type-safe environment variable validation for both frontend (studio) and backend applications. It uses `@t3-oss/env-core` for validation and Zod schemas for type safety.

## Structure

```
packages/env/
├── src/
│   ├── studio.ts    # Frontend environment variables
│   └── backend.ts   # Backend environment variables
└── package.json
```

## Usage

### Frontend (Studio)

```typescript
import { env } from "@elcokiin/env/studio";

// Type-safe access to client environment variables
const convexUrl = env.VITE_CONVEX_URL;
const siteUrl = env.VITE_CONVEX_SITE_URL;
```

### Backend

```typescript
import { env } from "@elcokiin/env/backend";

// Type-safe access to server environment variables
const nodeEnv = env.NODE_ENV;
const siteUrl = env.SITE_URL;
const authSecret = env.BETTER_AUTH_SECRET;
const adminEmails = env.ADMIN_EMAILS; // string[]
```

## Environment Variables

### Studio (Frontend)

| Variable | Type | Description |
|----------|------|-------------|
| `VITE_CONVEX_URL` | URL | Convex deployment URL |
| `VITE_CONVEX_SITE_URL` | URL | Convex site URL |

### Backend

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | enum | `development` | Environment mode |
| `SITE_URL` | URL | - | Application site URL |
| `BETTER_AUTH_SECRET` | string (32+ chars) | - | Auth secret key |
| `ADMIN_EMAILS` | comma-separated | `[]` | Admin email list |
| `GOOGLE_CLIENT_ID` | string | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | string | - | Google OAuth secret |
| `RESEND_API_KEY` | string (optional) | - | Resend API key for emails |
| `EMAIL_FROM` | email | `diego.tenjo@elcokiin.com` | From email address |

## Features

- **Type-safe**: Full TypeScript support with inferred types
- **Validation**: Zod schemas validate at runtime
- **Transformations**: e.g., `ADMIN_EMAILS` string to array
- **Defaults**: Sensible defaults where appropriate
- **Skip validation**: `SKIP_ENV_VALIDATION=true` to bypass checks

## Dependencies

- **@t3-oss/env-core** - Environment validation framework
- **zod** - Schema validation
- **dotenv** - Environment file loading
