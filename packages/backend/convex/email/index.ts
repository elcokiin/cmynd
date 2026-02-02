/**
 * Email module for elcokiin
 * 
 * Provides email sending functionality via Resend for:
 * - Email verification
 * - Password reset
 * 
 * Usage in auth.ts:
 * ```ts
 * import { internal } from "./_generated/api";
 * 
 * // In sendVerificationEmail handler:
 * ctx.scheduler.runAfter(0, internal.email.send.sendVerificationEmail, {
 *   to: user.email,
 *   userName: user.name,
 *   verificationUrl: url,
 * });
 * ```
 */

// Re-export send actions for use via internal API
export { sendVerificationEmail, sendPasswordResetEmail } from "./send";

// Re-export utilities for direct use if needed
export { isEmailEnabled, getEmailFrom } from "./client";

// Re-export templates for testing or preview
export {
  generateVerificationEmailHtml,
  generateVerificationEmailText,
} from "./templates/verification";
export {
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from "./templates/password-reset";
