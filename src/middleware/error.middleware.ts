import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { env } from '../config/env';

/**
 * Global error handling middleware.
 * Must be registered after all routes.
 * Logs the full error internally and returns a safe JSON response.
 * Stack traces are only included in development.
 */
export const errorHandler = (
  err: Error & { statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
