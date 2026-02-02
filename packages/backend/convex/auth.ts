import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";

import type { DataModel } from "./_generated/dataModel";

import { env } from "@elcokiin/env/backend";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import { isAdmin } from "./_lib/auth";

// Email utilities
import {
  createResendClient,
  getEmailFrom,
  isEmailEnabled,
} from "./email/client";
import {
  generateVerificationEmailHtml,
  generateVerificationEmailText,
} from "./email/templates/verification";
import {
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from "./email/templates/password_reset";

const siteUrl = env.SITE_URL;

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Send verification email via Resend.
 * Does not await to prevent timing attacks (as per Better Auth docs).
 */
async function sendVerificationEmailViaResend(
  userEmail: string,
  userName: string | undefined,
  verificationUrl: string,
): Promise<void> {
  // Always log in development for easy testing
  if (env.NODE_ENV === "development") {
    console.log(`\n[Auth] Verification email for ${userEmail}`);
    console.log(`[Auth] URL: ${verificationUrl}\n`);
  }

  // If Resend is not configured, skip sending
  if (!isEmailEnabled()) {
    if (env.NODE_ENV !== "development") {
      console.warn(
        "[Auth] RESEND_API_KEY not configured, verification email not sent",
      );
    }
    return;
  }

  const resend = createResendClient();
  if (!resend) {
    console.error("[Auth] Failed to create Resend client");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
      to: [userEmail],
      subject: "Verify your email address - elcokiin",
      html: generateVerificationEmailHtml({
        userName,
        verificationUrl,
      }),
      text: generateVerificationEmailText({
        userName,
        verificationUrl,
      }),
      tags: [{ name: "category", value: "verification" }],
    });

    if (error) {
      console.error("[Auth] Failed to send verification email:", error.message);
    } else {
      console.log(`[Auth] Verification email sent to ${userEmail}`);
    }
  } catch (err) {
    console.error("[Auth] Error sending verification email:", err);
  }
}

/**
 * Send password reset email via Resend.
 * Does not await to prevent timing attacks (as per Better Auth docs).
 */
async function sendPasswordResetEmailViaResend(
  userEmail: string,
  userName: string | undefined,
  resetUrl: string,
): Promise<void> {
  // Always log in development for easy testing
  if (env.NODE_ENV === "development") {
    console.log(`\n[Auth] Password reset email for ${userEmail}`);
    console.log(`[Auth] URL: ${resetUrl}\n`);
  }

  // If Resend is not configured, skip sending
  if (!isEmailEnabled()) {
    if (env.NODE_ENV !== "development") {
      console.warn(
        "[Auth] RESEND_API_KEY not configured, password reset email not sent",
      );
    }
    return;
  }

  const resend = createResendClient();
  if (!resend) {
    console.error("[Auth] Failed to create Resend client");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
      to: [userEmail],
      subject: "Reset your password - elcokiin",
      html: generatePasswordResetEmailHtml({
        userName,
        resetUrl,
      }),
      text: generatePasswordResetEmailText({
        userName,
        resetUrl,
      }),
      tags: [{ name: "category", value: "password_reset" }],
    });

    if (error) {
      console.error(
        "[Auth] Failed to send password reset email:",
        error.message,
      );
    } else {
      console.log(`[Auth] Password reset email sent to ${userEmail}`);
    }
  } catch (err) {
    console.error("[Auth] Error sending password reset email:", err);
  }
}

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      // Password reset handler
      sendResetPassword: async ({ user, url }) => {
        // Don't await to prevent timing attacks - I temporaly change this
        // void sendPasswordResetEmailViaResend(user.email, user.name, url);
        await sendPasswordResetEmailViaResend(user.email, user.name, url);
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      // Email verification handler
      sendVerificationEmail: async ({ user, url }) => {
        // void sendVerificationEmailViaResend(user.email, user.name, url);
        await sendVerificationEmailViaResend(user.email, user.name, url);
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  });
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});

export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    return await isAdmin(ctx);
  },
});
