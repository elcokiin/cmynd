"use node";

import { v } from "convex/values";

import { internalAction } from "../_generated/server";
import { createResendClient, getEmailFrom, isEmailEnabled } from "./client";
import {
  generateVerificationEmailHtml,
  generateVerificationEmailText,
} from "./templates/verification";
import {
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from "./templates/password-reset";

/**
 * Send email verification email via Resend.
 * 
 * This is an internal action that can be triggered from auth handlers.
 * It handles errors gracefully and does not throw (to prevent app crashes).
 */
export const sendVerificationEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.optional(v.string()),
    verificationUrl: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; error?: string }> => {
    const { to, userName, verificationUrl } = args;

    // Check if email sending is enabled
    if (!isEmailEnabled()) {
      console.log("[Email] Resend not configured, skipping email send");
      console.log(`[Email] Verification URL for ${to}: ${verificationUrl}`);
      return { success: true }; // Return success since this is expected in dev
    }

    const resend = createResendClient();
    if (!resend) {
      console.error("[Email] Failed to create Resend client");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
        to: [to],
        subject: "Verify your email address - elcokiin",
        html: generateVerificationEmailHtml({ userName, verificationUrl }),
        text: generateVerificationEmailText({ userName, verificationUrl }),
        tags: [
          { name: "category", value: "verification" },
        ],
      });

      if (error) {
        console.error("[Email] Resend error:", error.message);
        return { success: false, error: error.message };
      }

      console.log(`[Email] Verification email sent to ${to}, id: ${data?.id}`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[Email] Failed to send verification email:", message);
      return { success: false, error: message };
    }
  },
});

/**
 * Send password reset email via Resend.
 * 
 * This is an internal action that can be triggered from auth handlers.
 * It handles errors gracefully and does not throw (to prevent app crashes).
 */
export const sendPasswordResetEmail = internalAction({
  args: {
    to: v.string(),
    userName: v.optional(v.string()),
    resetUrl: v.string(),
  },
  handler: async (_ctx, args): Promise<{ success: boolean; error?: string }> => {
    const { to, userName, resetUrl } = args;

    // Check if email sending is enabled
    if (!isEmailEnabled()) {
      console.log("[Email] Resend not configured, skipping email send");
      console.log(`[Email] Password reset URL for ${to}: ${resetUrl}`);
      return { success: true }; // Return success since this is expected in dev
    }

    const resend = createResendClient();
    if (!resend) {
      console.error("[Email] Failed to create Resend client");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
        to: [to],
        subject: "Reset your password - elcokiin",
        html: generatePasswordResetEmailHtml({ userName, resetUrl }),
        text: generatePasswordResetEmailText({ userName, resetUrl }),
        tags: [
          { name: "category", value: "password_reset" },
        ],
      });

      if (error) {
        console.error("[Email] Resend error:", error.message);
        return { success: false, error: error.message };
      }

      console.log(`[Email] Password reset email sent to ${to}, id: ${data?.id}`);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[Email] Failed to send password reset email:", message);
      return { success: false, error: message };
    }
  },
});
