import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// const isServer = typeof window === "undefined";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CONVEX_URL: z.url(),
    VITE_CONVEX_SITE_URL: z.url(),
    
    // Retry configuration (optional with defaults)
    VITE_RETRY_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
    VITE_RETRY_INITIAL_DELAY_MS: z.coerce.number().int().min(100).max(10000).default(1000),
    VITE_RETRY_MAX_DELAY_MS: z.coerce.number().int().min(1000).max(60000).default(30000),
    VITE_RETRY_BACKOFF_MULTIPLIER: z.coerce.number().min(1).max(5).default(2),
  },
  runtimeEnv: import.meta.env,
});
