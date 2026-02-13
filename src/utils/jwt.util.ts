import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import crypto from 'crypto';

/** Payload stored inside JWT tokens */
export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Generate a short-lived access token (default: 7 days).
 * Used for authenticating API requests.
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

/**
 * Generate a long-lived refresh token (default: 30 days).
 * Used to obtain new access tokens without re-login.
 * Includes a unique jti (JWT ID) to prevent duplicate tokens.
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(), // Add unique identifier
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
    }
  );
};

/**
 * Verify and decode an access token.
 * Throws if the token is invalid or expired.
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
};

/**
 * Verify and decode a refresh token.
 * Throws if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
};
