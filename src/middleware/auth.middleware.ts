import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import logger from '../config/logger';

/**
 * Express middleware that verifies JWT access tokens.
 * Extracts the token from the Authorization header (Bearer scheme),
 * verifies it, and attaches the decoded payload to req.user.
 * Returns 401 if the token is missing, invalid, or expired.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    logger.warn('Authentication failed: Invalid or expired token');
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
