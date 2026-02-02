/**
 * Resend Component Wrapper for elcokiin
 * 
 * This module provides the @convex-dev/resend component instance for reliable email delivery.
 * 
 * Features:
 * - Automatic batching and queueing
 * - Idempotency keys to prevent duplicate sends
 * - Rate limiting based on Resend API limits
 * - Durable execution with retries
 * 
 * Note: Auth.ts uses direct Resend SDK calls since Better Auth callbacks 
 * don't have access to Convex ctx. This component is used for other email
 * sending needs via internal mutations.
 */

import { Resend } from "@convex-dev/resend";

import { components } from "../_generated/api";

export const resend = new Resend(components.resend, {
  // testMode: true by default for safety during development
  // Only allows delivery to test addresses like delivered@resend.dev
  // Set to false in production to send to real addresses
  testMode: process.env.NODE_ENV !== "production",
});
