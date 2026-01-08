import type { AppError, ConvexAppError } from "./base";
import { ErrorCode } from "./codes";

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && "code" in error && "statusCode" in error;
}

/**
 * Type guard to check if error is a ConvexAppError
 */
export function isConvexAppError(error: unknown): error is ConvexAppError {
  return (
    error instanceof Error &&
    (error.constructor.name as string).includes("Error") &&
    "code" in error
  );
}

/**
 * Parse unknown error into structured format
 */
export function parseError(error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
} {
  if (isAppError(error) || isConvexAppError(error)) {
    return {
      message: (error as Error).message,
      code: error.code,
      statusCode: error.statusCode,
      context: "context" in error ? (error as AppError).context : undefined,
    };
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
 * User-friendly error message mapping
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  [ErrorCode.UNAUTHENTICATED]: "Please sign in to continue",
  [ErrorCode.UNAUTHORIZED]: "You don't have permission to do that",
  [ErrorCode.ADMIN_REQUIRED]: "This action requires admin privileges",
  [ErrorCode.DOCUMENT_NOT_FOUND]: "Document not found",
  [ErrorCode.DOCUMENT_OWNERSHIP]: "You don't have access to this document",
  [ErrorCode.DOCUMENT_ALREADY_PUBLISHED]: "This document is already published",
  [ErrorCode.DOCUMENT_PENDING_REVIEW]:
    "This document is currently under review",
  [ErrorCode.DOCUMENT_PUBLISHED]: "Published documents cannot be edited",
  [ErrorCode.DOCUMENT_VALIDATION]: "Please check your input and try again",
  [ErrorCode.DOCUMENT_RATE_LIMIT]:
    "You've reached the submission limit. Try again in 24 hours.",
  [ErrorCode.DOCUMENT_INVALID_STATUS]:
    "This action cannot be performed on the document's current status",
  [ErrorCode.VALIDATION_ERROR]: "Please check your input and try again",
  [ErrorCode.ZOD_VALIDATION]: "Please check your input and try again",
  [ErrorCode.NETWORK_ERROR]: "Network error. Please check your connection.",
  [ErrorCode.NETWORK_TIMEOUT]: "Request timed out. Please try again.",
  [ErrorCode.UNKNOWN]: "Something went wrong. Please try again.",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const parsed = parseError(error);

  if (parsed.code && parsed.code in ERROR_MESSAGE_MAP) {
    const message = ERROR_MESSAGE_MAP[parsed.code];
    if (message) return message;
  }

  return parsed.message ?? ERROR_MESSAGE_MAP[ErrorCode.UNKNOWN] ?? "Something went wrong";
}

/**
 * Check if error is retryable (network errors, timeouts, rate limits)
 */
export function isRetryableError(error: unknown): boolean {
  const parsed = parseError(error);

  if (!parsed.code) return false;

  const retryableCodes: string[] = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.DOCUMENT_RATE_LIMIT,
  ];

  return retryableCodes.includes(parsed.code);
}
