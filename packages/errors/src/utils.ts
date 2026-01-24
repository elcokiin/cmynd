import { ConvexError } from "convex/values";

import type { ErrorCode } from "./codes";
import { ErrorCode as ErrorCodes } from "./codes";
import { ERROR_DEFAULTS, USER_FRIENDLY_MESSAGES } from "./messages";

/**
 * Structured error data for ConvexError
 */
type ErrorData = {
  code: ErrorCode;
  message: string;
};

/**
 * Throw a structured ConvexError with code and optional message.
 * Use in all Convex queries, mutations, and actions.
 *
 * If no message is provided, a default message is used from ERROR_DEFAULTS.
 *
 * @example
 * ```ts
 * import { throwConvexError, ErrorCode } from "@elcokiin/errors";
 *
 * // Use default message
 * throwConvexError(ErrorCode.UNAUTHENTICATED);
 *
 * // Use custom message (e.g., with dynamic content)
 * throwConvexError(ErrorCode.DOCUMENT_NOT_FOUND, `Document ${docId} not found`);
 * ```
 */
export function throwConvexError(code: ErrorCode, message?: string): never {
  const errorMessage = message ?? ERROR_DEFAULTS[code] ?? "An error occurred";
  throw new ConvexError({ code, message: errorMessage });
}

/**
 * Parse unknown error into structured format
 */
export function parseError(error: unknown): {
  message: string;
  code?: string;
} {
  // Handle ConvexError with our { code, message } structure
  if (error instanceof ConvexError) {
    const data = error.data as unknown;

    if (typeof data === "object" && data !== null && "code" in data) {
      const errorData = data as ErrorData;
      return {
        message: errorData.message ?? "An error occurred",
        code: errorData.code,
      };
    }

    // Handle simple string ConvexError
    if (typeof data === "string") {
      return { message: data };
    }
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "An unknown error occurred" };
}

/**
 * Get user-friendly error message for frontend display.
 *
 * @example
 * ```ts
 * import { getUserFriendlyMessage } from "@elcokiin/errors";
 *
 * try {
 *   await convex.mutation(api.documents.create, { ... });
 * } catch (error) {
 *   const message = getUserFriendlyMessage(error);
 *   toast.error(message);
 * }
 * ```
 */
export function getUserFriendlyMessage(error: unknown): string {
  const parsed = parseError(error);

  if (parsed.code && parsed.code in USER_FRIENDLY_MESSAGES) {
    const message = USER_FRIENDLY_MESSAGES[parsed.code as ErrorCode];
    if (message) return message;
  }

  return (
    parsed.message ??
    USER_FRIENDLY_MESSAGES[ErrorCodes.UNKNOWN] ??
    "Something went wrong"
  );
}
