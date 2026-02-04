/**
 * Email module for elcokiin
 *
 * Provides email sending functionality via @convex-dev/resend component for:
 * - Email verification
 * - Password reset
 *
 * Architecture:
 * - auth.ts: Uses direct Resend SDK calls (no ctx available in Better Auth callbacks)
 * - send.ts: Uses @convex-dev/resend component for reliable delivery (requires ctx)
 *
 * The component provides:
 * - Automatic batching and queueing
 * - Idempotency keys to prevent duplicate sends
 * - Rate limiting based on Resend API limits
 * - Durable execution with retries
 *
 * Usage via scheduler:
 * ```ts
 * import { internal } from "./_generated/api";
 *
 * // In a mutation/action with ctx:
 * await ctx.scheduler.runAfter(0, internal.email.send.sendVerificationEmail, {
 *   to: user.email,
 *   userName: user.name,
 *   verificationUrl: url,
 * });
 * ```
 */

// Re-export send mutations for use via internal API
export { sendPasswordResetEmail, sendVerificationEmail } from "./send";

// Re-export Resend component instance for direct use
export { resend } from "./resend";

// Re-export utilities for direct use (auth.ts still needs these)
export { getEmailFrom, isEmailEnabled } from "./client";

// Re-export templates for testing or preview
export {
  generateVerificationEmailHtml,
  generateVerificationEmailText,
} from "./templates/verification";
export {
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from "./templates/password_reset";
