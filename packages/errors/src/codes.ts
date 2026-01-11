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

  // Validation Errors (3xxx)
  VALIDATION_ERROR: "VAL_3001",
  INVALID_INPUT: "VAL_3002",
  ZOD_VALIDATION: "VAL_3003",

  // Unknown Errors (9xxx)
  UNKNOWN: "ERR_9999",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
