/**
 * Error Code Constants
 * 
 * For detailed error messages and descriptions, see the `/messages` folder.
 * Each error code has a corresponding message file with full context and guidance.
 */

export const ErrorCode = {
  // Authentication & Authorization (1xxx)
  UNAUTHENTICATED: "AUTH_1001",
  UNAUTHORIZED: "AUTH_1002",
  ADMIN_REQUIRED: "AUTH_1003",

  // Document Errors (2xxx)
  DOCUMENT_NOT_FOUND: "DOC_2001",
  DOCUMENT_OWNERSHIP: "DOC_2002",
  DOCUMENT_ALREADY_PUBLISHED: "DOC_2003",
  DOCUMENT_PENDING_REVIEW: "DOC_2004",
  DOCUMENT_PUBLISHED: "DOC_2005",
  DOCUMENT_VALIDATION: "DOC_2006",
  DOCUMENT_RATE_LIMIT: "DOC_2007",
  DOCUMENT_INVALID_STATUS: "DOC_2008",
  DOCUMENT_INVALID_TITLE: "DOC_2009",
  DOCUMENT_EMPTY: "DOC_2010",
  DOCUMENT_SLUG_DELETION_REQUIRED: "DOC_2011",

  // Validation Errors (3xxx)
  VALIDATION_ERROR: "VAL_3001",
  INVALID_INPUT: "VAL_3002",
  ZOD_VALIDATION: "VAL_3003",

  // Storage Errors (4xxx)
  STORAGE_UPLOAD_FAILED: "STOR_4001",
  STORAGE_URL_FAILED: "STOR_4002",
  STORAGE_NOT_CONFIGURED: "STOR_4003",
  STORAGE_INVALID_FILE_TYPE: "STOR_4004",

  // Configuration Errors (5xxx)
  CONFIG_MISSING_ENV: "CFG_5001",

  // Author Errors (6xxx)
  AUTHOR_NOT_FOUND: "AUTHOR_6001",
  AUTHOR_OWNERSHIP: "AUTHOR_6002",
  AUTHOR_INVALID_AVATAR_URL: "AUTHOR_6003",

  // Unknown Errors (9xxx)
  UNKNOWN: "ERR_9999",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
