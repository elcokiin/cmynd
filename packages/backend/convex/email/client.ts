import { Resend } from "resend";

import { env } from "@elcokiin/env/backend";

/**
 * Create a Resend client instance.
 * Returns null if RESEND_API_KEY is not configured (development fallback).
 */
export function createResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

/**
 * Get the sender email address from environment.
 */
export function getEmailFrom(): string {
  return env.EMAIL_FROM;
}

/**
 * Check if email sending is enabled (API key is configured).
 */
export function isEmailEnabled(): boolean {
  return !!env.RESEND_API_KEY;
}
