import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// For server-side (SSR/Vercel functions), we need process.env
// For client-side, Vite statically replaces import.meta.env.VITE_* at build time
const isServer = typeof window === "undefined";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CONVEX_URL: z.url(),
    VITE_CONVEX_SITE_URL: z.url(),
  },
  runtimeEnv: isServer
    ? {
        // Server-side: use process.env
        VITE_CONVEX_URL: process.env.VITE_CONVEX_URL,
        VITE_CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL,
      }
    : {
        // Client-side: use static import.meta.env access (Vite replaces at build time)
        VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
        VITE_CONVEX_SITE_URL: import.meta.env.VITE_CONVEX_SITE_URL,
      },
  emptyStringAsUndefined: true,
});
