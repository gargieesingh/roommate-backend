/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { AdminUsersService } from '../services/admin-users.service';

const adminUsersService = new AdminUsersService();

export class AdminUsersController {
    /** GET /api/admin/users */
    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminUsersService.getUsers({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
                status: req.query.status as string,
                emailVerified: req.query.emailVerified === 'true' ? true : req.query.emailVerified === 'false' ? false : undefined,
                phoneVerified: req.query.phoneVerified === 'true' ? true : req.query.phoneVerified === 'false' ? false : undefined,
                gender: req.query.gender as string,
                city: req.query.city as string,
                sortBy: req.query.sortBy as string,
                sortOrder: req.query.sortOrder as 'asc' | 'desc',
            });

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /** GET /api/admin/users/:id */
    async getUserById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await adminUsersService.getUserById(req.params.id);

            res.json({
                success: true,
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** PUT /api/admin/users/:id */
    async updateUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const user = await adminUsersService.updateUser(req.params.id, req.body, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User updated successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/suspend */
    async suspendUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { duration, reason } = req.body;

            const user = await adminUsersService.suspendUser(req.params.id, duration, reason, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User suspended successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/ban */
    async banUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { reason } = req.body;

            const user = await adminUsersService.banUser(req.params.id, reason, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User banned successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/unban */
    async unbanUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;

            const user = await adminUsersService.unbanUser(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User unbanned successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/unsuspend */
    async unsuspendUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;

            const user = await adminUsersService.unsuspendUser(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User suspension removed successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/verify-email */
    async verifyEmail(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;

            const user = await adminUsersService.verifyEmail(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Email verified successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** POST /api/admin/users/:id/verify-phone */
    async verifyPhone(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;

            const user = await adminUsersService.verifyPhone(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Phone verified successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /** DELETE /api/admin/users/:id */
    async deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;

            await adminUsersService.deleteUser(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    async bulkAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { userIds, action } = req.body;

            const result = await adminUsersService.bulkAction(userIds, action, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Bulk action completed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
