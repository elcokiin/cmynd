import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    SITE_URL: z
      .url()
      .refine(
        (url) => url.startsWith("http://") || url.startsWith("https://"),
        "URL must include 'http://' or 'https://' protocol",
      ),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "Secret must be at least 32 characters"),
    ADMIN_EMAILS: z
      .string()
      .default("")
      .transform((val) =>
        val ? val.split(",").map((email) => email.trim().toLowerCase()) : []
      ),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
