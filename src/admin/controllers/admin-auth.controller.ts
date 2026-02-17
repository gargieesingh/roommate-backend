/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';

const adminAuthService = new AdminAuthService();

export class AdminAuthController {
    /** POST /api/admin/auth/login */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await adminAuthService.login(email, password);

            res.json({
                success: true,
                message: 'Admin login successful',
                data: result,
            });
        } catch (error: any) {
            // Return 403 for admin privilege errors, 401 for invalid credentials
            if (error.message.includes('Admin privileges required')) {
                res.status(403).json({
                    success: false,
                    message: error.message,
                });
                return;
            }

            res.status(401).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }

    /** GET /api/admin/auth/me */
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.userId;
            const admin = await adminAuthService.getProfile(userId);

            res.json({
                success: true,
                data: { admin },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/auth/logout */
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // For now, logout is handled client-side by removing the token
            // In the future, we could add token blacklisting with Redis
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
