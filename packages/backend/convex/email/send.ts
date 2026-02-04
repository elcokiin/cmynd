import { v } from "convex/values";

import { internalMutation } from "../_generated/server";
import { getEmailFrom } from "./client";
import { resend } from "./resend";
import {
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from "./templates/password_reset";
import {
  generateVerificationEmailHtml,
  generateVerificationEmailText,
} from "./templates/verification";

/**
 * Send email verification email via Resend component.
 *
 * Uses the @convex-dev/resend component for reliable delivery with:
 * - Automatic batching
 * - Idempotency keys to prevent duplicate sends
 * - Rate limiting based on Resend API limits
 * - Durable execution with retries
 *
 * Note: This internal mutation can be scheduled via ctx.scheduler.runAfter()
 * from other mutations/actions that have access to ctx.
 */
export const sendVerificationEmail = internalMutation({
  args: {
    to: v.string(),
    userName: v.optional(v.string()),
    verificationUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { to, userName, verificationUrl } = args;

    const emailId = await resend.sendEmail(ctx, {
      from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
      to,
      subject: "Verify your email address - elcokiin",
      html: generateVerificationEmailHtml({ userName, verificationUrl }),
      text: generateVerificationEmailText({ userName, verificationUrl }),
    });

    console.log(
      `[Email] Verification email queued for ${to}, emailId: ${emailId}`,
    );
    return { success: true, emailId };
  },
});

/**
 * Send password reset email via Resend component.
 *
 * Uses the @convex-dev/resend component for reliable delivery with:
 * - Automatic batching
 * - Idempotency keys to prevent duplicate sends
 * - Rate limiting based on Resend API limits
 * - Durable execution with retries
 */
export const sendPasswordResetEmail = internalMutation({
  args: {
    to: v.string(),
    userName: v.optional(v.string()),
    resetUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { to, userName, resetUrl } = args;

    const emailId = await resend.sendEmail(ctx, {
      from: `elcokiin - Diego Tenjo <${getEmailFrom()}>`,
      to,
      subject: "Reset your password - elcokiin",
      html: generatePasswordResetEmailHtml({ userName, resetUrl }),
      text: generatePasswordResetEmailText({ userName, resetUrl }),
    });

    console.log(
      `[Email] Password reset email queued for ${to}, emailId: ${emailId}`,
    );
    return { success: true, emailId };
  },
});
