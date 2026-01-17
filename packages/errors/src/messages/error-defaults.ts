import type { ErrorCode } from "../codes";
import { ErrorCode as ErrorCodes } from "../codes";

/**
 * Default error messages for Convex backend functions.
 * These are technical messages used in Convex functions when no custom message is provided.
 * 
 * Used by: throwConvexError() when message parameter is omitted.
 */
export const ERROR_DEFAULTS: Record<ErrorCode, string> = {
  // Authentication (1xxx)
  [ErrorCodes.UNAUTHENTICATED]: "Not authenticated",
  [ErrorCodes.UNAUTHORIZED]: "Unauthorized",
  [ErrorCodes.ADMIN_REQUIRED]: "Admin access required",

  // Document Errors (2xxx)
  [ErrorCodes.DOCUMENT_NOT_FOUND]: "Document not found",
  [ErrorCodes.DOCUMENT_OWNERSHIP]: "You don't own this document",
  [ErrorCodes.DOCUMENT_ALREADY_PUBLISHED]: "Document is already published",
  [ErrorCodes.DOCUMENT_PENDING_REVIEW]: "Cannot edit a document that is pending review",
  [ErrorCodes.DOCUMENT_PUBLISHED]: "Cannot edit a published document",
  [ErrorCodes.DOCUMENT_VALIDATION]: "Document validation failed",
  [ErrorCodes.DOCUMENT_RATE_LIMIT]: "Rate limit exceeded: You can only submit a document 3 times per 24 hours",
  [ErrorCodes.DOCUMENT_INVALID_STATUS]: "Invalid document status for this operation",

  // Validation Errors (3xxx)
  [ErrorCodes.VALIDATION_ERROR]: "Validation failed",
  [ErrorCodes.INVALID_INPUT]: "Invalid input",
  [ErrorCodes.ZOD_VALIDATION]: "Validation failed",

  // Storage Errors (4xxx)
  [ErrorCodes.STORAGE_UPLOAD_FAILED]: "Failed to upload file",
  [ErrorCodes.STORAGE_URL_FAILED]: "Failed to get file URL",
  [ErrorCodes.STORAGE_NOT_CONFIGURED]: "Storage upload function not configured",
  [ErrorCodes.STORAGE_INVALID_FILE_TYPE]: "Invalid file type",

  // Configuration Errors (5xxx)
  [ErrorCodes.CONFIG_MISSING_ENV]: "Application configuration error",

  // Author Errors (6xxx)
  [ErrorCodes.AUTHOR_NOT_FOUND]: "Author not found",
  [ErrorCodes.AUTHOR_OWNERSHIP]: "You don't own this author profile",
  [ErrorCodes.AUTHOR_INVALID_AVATAR_URL]: "Invalid avatar URL format",

  // Unknown Errors (9xxx)
  [ErrorCodes.UNKNOWN]: "An error occurred",
};
