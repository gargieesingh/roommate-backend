import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import crypto from 'crypto';

/** Payload stored inside admin JWT tokens */
export interface AdminJWTPayload {
    userId: string;
    email: string;
    isAdmin: true;
}

/**
 * Generate a short-lived admin access token (default: 12 hours).
 * Used for authenticating admin API requests.
 */
export const generateAdminAccessToken = (payload: Omit<AdminJWTPayload, 'isAdmin'>): string => {
    return jwt.sign(
        { ...payload, isAdmin: true } as any,
        (process.env.ADMIN_JWT_SECRET || env.JWT_SECRET) as string,
        {
            expiresIn: (process.env.ADMIN_JWT_EXPIRES_IN || '12h') as any,
        }
    );
};

/**
 * Generate a long-lived admin refresh token (default: 7 days).
 * Used to obtain new access tokens without re-login.
 */
export const generateAdminRefreshToken = (payload: Omit<AdminJWTPayload, 'isAdmin'>): string => {
    return jwt.sign(
        {
            ...payload,
            isAdmin: true,
            jti: crypto.randomUUID(),
        } as any,
        (process.env.ADMIN_JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET) as string,
        {
            expiresIn: (process.env.ADMIN_JWT_REFRESH_EXPIRES_IN || '7d') as any,
        }
    );
};

/**
 * Verify and decode an admin access token.
 * Throws if the token is invalid or expired.
 */
export const verifyAdminAccessToken = (token: string): AdminJWTPayload => {
    return jwt.verify(
        token,
        process.env.ADMIN_JWT_SECRET || env.JWT_SECRET
    ) as AdminJWTPayload;
};

/**
 * Verify and decode an admin refresh token.
 * Throws if the token is invalid or expired.
 */
export const verifyAdminRefreshToken = (token: string): AdminJWTPayload => {
    return jwt.verify(
        token,
        process.env.ADMIN_JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET
    ) as AdminJWTPayload;
};
