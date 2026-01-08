import type { z } from "zod";
import { ConvexAppError } from "../base";
import { ErrorCode } from "../codes";

export class ValidationError extends ConvexAppError {
  readonly code = ErrorCode.VALIDATION_ERROR;
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class ZodValidationError extends ConvexAppError {
  readonly code = ErrorCode.ZOD_VALIDATION;
  readonly statusCode = 400;
  readonly fieldErrors: Record<string, string[]>;

  constructor(zodError: z.ZodError) {
    const fieldErrors = zodError.flatten().fieldErrors;
    const entries = Object.entries(fieldErrors);
    const firstErrorEntry = entries.find(
      ([, errors]) => Array.isArray(errors) && errors.length > 0
    );
    const errorArray = firstErrorEntry?.[1];
    const firstError = (Array.isArray(errorArray) ? errorArray[0] : undefined) || "Validation failed";
    super(firstError);
    this.fieldErrors = fieldErrors as Record<string, string[]>;
  }

  static fromZodError(zodError: z.ZodError): ZodValidationError {
    return new ZodValidationError(zodError);
  }
}
