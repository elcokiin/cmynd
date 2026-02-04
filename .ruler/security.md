# Security Guidelines

## Core Security Rules

These rules are **non-negotiable** and must be followed in every implementation.

---

## Rule 1: Always Validate User Input

**You MUST validate ALL external input using Zod.** Never trust data from users, APIs, or any external source.

```typescript
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

function registerUser(input: unknown) {
  const validated = userSchema.parse(input);
  // validated is now type-safe and validated
}
```

---

## Rule 2: Always Enforce Authentication & Authorization

**You MUST check authentication in every protected backend function.** Use `ctx.auth.getUserIdentity()` in Convex.

```typescript
export const getPrivateData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.query("privateData").collect();
  },
});
```

**NEVER accept userId, email, or permissions as arguments for access control** - always derive them from the session.

---

## Rule 3: Never Expose Sensitive Data

**You MUST filter out sensitive fields** (passwords, tokens, API keys, etc.) before returning data.

```typescript
const { password, tokenIdentifier, apiKey, ...publicUser } = user;
return publicUser;
```

---

## Rule 4: Always Sanitize User-Generated Content

**You MUST sanitize HTML** before rendering user-generated content to prevent XSS attacks. Use `DOMPurify`.

```typescript
import DOMPurify from "dompurify";

function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

## Environment Variables

- Store secrets in `.env` files (gitignored)
- Use `@elcokiin/env` package for type-safe env access
- **NEVER commit `.env` files**
- Document required env vars in `.env.example`
