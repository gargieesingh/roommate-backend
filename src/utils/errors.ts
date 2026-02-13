/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Helper function to create validation errors
 */
export function createValidationError(message: string): AppError {
  return new AppError(message, 400);
}

/**
 * Helper function to create not found errors
 */
export function createNotFoundError(resource: string): AppError {
  return new AppError(`${resource} not found`, 404);
}

/**
 * Helper function to create unauthorized errors
 */
export function createUnauthorizedError(message: string = 'Unauthorized'): AppError {
  return new AppError(message, 401);
}

/**
 * Helper function to create forbidden errors
 */
export function createForbiddenError(message: string = 'Forbidden'): AppError {
  return new AppError(message, 403);
}
