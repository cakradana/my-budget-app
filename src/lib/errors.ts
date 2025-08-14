/**
 * Custom error classes and error handling utilities
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 400, true);
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, true);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, true);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;

  constructor(resource?: string) {
    const message = resource ? `${resource} not found` : "Resource not found";
    super(message, 404, true);
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error class (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = "Too many requests", retryAfter?: number) {
    super(message, 429, true);
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database error class
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message?: string) {
    super(message || `External service ${service} failed`, 502, false);
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    field?: string;
    retryAfter?: number;
  };
}

/**
 * Handle and format errors for API responses
 */
export function handleError(error: unknown): ErrorResponse {
  // Handle known operational errors
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        statusCode: error.statusCode,
        timestamp: error.timestamp,
        ...(error instanceof ValidationError && error.field
          ? { field: error.field }
          : {}),
        ...(error instanceof RateLimitError && error.retryAfter
          ? { retryAfter: error.retryAfter }
          : {}),
      },
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "name" in error) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error: {
          message: "Validation failed",
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: {
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : error.message,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Handle unknown errors
  console.error("Unknown error:", error);
  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Async error handler wrapper for API routes
 */
export function asyncHandler<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

/**
 * Create an error logger
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
  }

  // In production, you would send this to a logging service
  // like Sentry, LogRocket, or DataDog
  if (process.env.NODE_ENV === "production") {
    // TODO: Implement production error logging
    // e.g., Sentry.captureException(error, { extra: context });
  }
}
