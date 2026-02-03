# @elcokiin/errors

Shared error handling utilities with typed error codes and user-friendly messages.

## Overview

This package provides a centralized error handling system with:
- Typed error codes for consistent error identification
- User-friendly error messages for frontend display
- Utilities for error parsing and handling

## Structure

```
packages/errors/
├── src/
│   ├── codes.ts            # Error code constants
│   ├── index.ts            # Main exports
│   ├── utils.ts            # Error utilities
│   └── messages/
│       ├── index.ts        # Message exports
│       ├── error-defaults.ts  # Default error messages
│       └── user-friendly.ts   # User-friendly messages
└── package.json
```

## Error Codes

Error codes are organized by category:

| Range | Category |
|-------|----------|
| `AUTH_1xxx` | Authentication & Authorization |
| `DOC_2xxx` | Document Errors |
| `VAL_3xxx` | Validation Errors |
| `STOR_4xxx` | Storage Errors |
| `CFG_5xxx` | Configuration Errors |
| `AUTHOR_6xxx` | Author Errors |
| `ERR_9xxx` | Unknown Errors |

## Usage

```typescript
// Import error codes
import { ErrorCode } from "@elcokiin/errors/codes";

// Use in backend
throw new ConvexError({
  code: ErrorCode.DOCUMENT_NOT_FOUND,
  message: "Document not found"
});

// Import user-friendly messages
import { getUserFriendlyMessage } from "@elcokiin/errors/messages";

// Get user-friendly error message
const message = getUserFriendlyMessage(ErrorCode.DOCUMENT_NOT_FOUND);
// => "The document you're looking for couldn't be found"

// Import utilities
import { parseError } from "@elcokiin/errors/utils";

// Parse errors
const parsed = parseError(error);
```

## Available Error Codes

```typescript
const ErrorCode = {
  // Authentication
  UNAUTHENTICATED: "AUTH_1001",
  UNAUTHORIZED: "AUTH_1002", 
  ADMIN_REQUIRED: "AUTH_1003",

  // Documents
  DOCUMENT_NOT_FOUND: "DOC_2001",
  DOCUMENT_OWNERSHIP: "DOC_2002",
  DOCUMENT_ALREADY_PUBLISHED: "DOC_2003",
  // ... more

  // Validation
  VALIDATION_ERROR: "VAL_3001",
  INVALID_INPUT: "VAL_3002",
  ZOD_VALIDATION: "VAL_3003",

  // Storage
  STORAGE_UPLOAD_FAILED: "STOR_4001",
  // ... more
};
```

## Scripts

```bash
bun run check-types  # TypeScript type checking
```

## Dependencies

- **convex** - ConvexError type
- **zod** - Schema validation
