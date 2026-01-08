import { ConvexError } from "convex/values";

/**
 * Base application error class.
 * Use this for non-Convex contexts (frontend, utilities).
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: number;
  readonly isOperational: boolean;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name as string;
    this.timestamp = Date.now();
    this.isOperational = isOperational;
    this.context = context;
    
    // Capture stack trace if available (Node.js environment)
    const ErrorConstructor = Error as typeof Error & {
      captureStackTrace?: (targetObject: object, constructorOpt: Function) => void;
    };
    if (ErrorConstructor.captureStackTrace) {
      ErrorConstructor.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Base Convex error class.
 * Use this in all Convex backend functions for better error messages in dashboard.
 * Extends ConvexError to preserve Convex-specific functionality.
 */
export abstract class ConvexAppError extends ConvexError<string> {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: number;
  readonly isOperational: boolean;

  constructor(message: string, isOperational = true) {
    super(message);
    this.timestamp = Date.now();
    this.isOperational = isOperational;
  }
}
