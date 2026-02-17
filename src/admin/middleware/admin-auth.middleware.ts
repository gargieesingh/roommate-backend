import { Request, Response, NextFunction } from 'express';
import { verifyAdminAccessToken } from '../utils/admin-jwt.util';
import prisma from '../../config/database';
import logger from '../../config/logger';

/**
 * Express middleware that verifies admin JWT access tokens.
 * Extracts the token from the Authorization header (Bearer scheme),
 * verifies it, confirms the user is an admin, and attaches the payload to req.user.
 * Returns 401 if the token is missing, invalid, or expired.
 * Returns 403 if the user is not an admin.
 */
export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        // Verify the token
        const payload = verifyAdminAccessToken(token);

        // Verify the user exists and is still an admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                isAdmin: true,
                isActive: true,
                isBanned: true,
            },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found.',
            });
            return;
        }

        if (!user.isAdmin) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
            return;
        }

        if (!user.isActive || user.isBanned) {
            res.status(403).json({
                success: false,
                message: 'Account is inactive or banned.',
            });
            return;
        }

        // Attach admin user to request
        req.user = payload;
        next();
    } catch (error) {
        logger.warn('Admin authentication failed: Invalid or expired token');
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
