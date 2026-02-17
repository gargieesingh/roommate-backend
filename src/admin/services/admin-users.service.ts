import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminUsersService {
    /**
     * Get paginated, filtered list of users
     */
    async getUsers(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        emailVerified?: boolean;
        phoneVerified?: boolean;
        gender?: string;
        city?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        // Search across name, email, phone
        if (params.search) {
            where.OR = [
                { email: { contains: params.search, mode: 'insensitive' } },
                { firstName: { contains: params.search, mode: 'insensitive' } },
                { lastName: { contains: params.search, mode: 'insensitive' } },
                { phone: { contains: params.search } },
            ];
        }

        // Filter by status
        if (params.status === 'active') {
            where.isActive = true;
            where.isBanned = false;
            where.suspendedUntil = null;
        } else if (params.status === 'banned') {
            where.isBanned = true;
        } else if (params.status === 'suspended') {
            where.suspendedUntil = { gt: new Date() };
        } else if (params.status === 'inactive') {
            where.isActive = false;
        }

        // Filter by verification
        if (params.emailVerified !== undefined) {
            where.emailVerified = params.emailVerified;
        }
        if (params.phoneVerified !== undefined) {
            where.phoneVerified = params.phoneVerified;
        }

        // Filter by gender
        if (params.gender) {
            where.gender = params.gender;
        }

        // Filter by city
        if (params.city) {
            where.city = { contains: params.city, mode: 'insensitive' };
        }

        // Sorting
        const orderBy: any = {};
        if (params.sortBy === 'joinDate') {
            orderBy.createdAt = params.sortOrder || 'desc';
        } else if (params.sortBy === 'name') {
            orderBy.firstName = params.sortOrder || 'asc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    city: true,
                    gender: true,
                    emailVerified: true,
                    phoneVerified: true,
                    isActive: true,
                    isBanned: true,
                    suspendedUntil: true,
                    createdAt: true,
                    profilePhoto: true,
                    _count: {
                        select: {
                            listings: true,
                            reportsReceived: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get complete user detail
     */
    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                listings: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        city: true,
                        rent: true,
                        isActive: true,
                        isFlagged: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                teamMembers: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                                isActive: true,
                            },
                        },
                    },
                },
                reviewsReceived: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        reviewer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                _count: {
                    select: {
                        listings: true,
                        reportsMade: true,
                        reportsReceived: true,
                        favorites: true,
                        reviewsGiven: true,
                        reviewsReceived: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Remove sensitive data
        const { passwordHash, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }

    /**
     * Update user
     */
    async updateUser(userId: string, data: any, adminId: string, ipAddress?: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                city: true,
                emailVerified: true,
                phoneVerified: true,
                isActive: true,
                adminNotes: true,
            },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'UPDATE_USER',
            entityType: 'USER',
            entityId: userId,
            details: { changes: data },
            ipAddress,
        });

        return updatedUser;
    }

    /**
     * Suspend user
     */
    async suspendUser(
        userId: string,
        duration: string,
        reason: string,
        adminId: string,
        ipAddress?: string
    ) {
        let suspendedUntil: Date;

        // Calculate suspension end date
        switch (duration) {
            case '1day':
                suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                break;
            case '3days':
                suspendedUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                break;
            case '7days':
                suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                throw new Error('Invalid suspension duration');
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                suspendedUntil,
                suspensionReason: reason,
            },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'SUSPEND_USER',
            entityType: 'USER',
            entityId: userId,
            details: { duration, reason, suspendedUntil },
            ipAddress,
        });

        return user;
    }

    /**
     * Ban user permanently
     */
    async banUser(userId: string, reason: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                banReason: reason,
            },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'BAN_USER',
            entityType: 'USER',
            entityId: userId,
            details: { reason },
            ipAddress,
        });

        return user;
    }

    /**
     * Unban user
     */
    async unbanUser(userId: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: false,
                banReason: null,
            },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'UNBAN_USER',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }

    /**
     * Remove suspension
     */
    async unsuspendUser(userId: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                suspendedUntil: null,
                suspensionReason: null,
            },
        });

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'UNSUSPEND_USER',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }

    /**
     * Verify user email
     */
    async verifyEmail(userId: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        });

        await auditLogService.log({
            adminId,
            actionType: 'VERIFY_EMAIL',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }

    /**
     * Verify user phone
     */
    async verifyPhone(userId: string, adminId: string, ipAddress?: string) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { phoneVerified: true },
        });

        await auditLogService.log({
            adminId,
            actionType: 'VERIFY_PHONE',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }

    /**
     * Delete user (soft delete by setting isActive to false)
     */
    async deleteUser(userId: string, adminId: string, ipAddress?: string) {
        // Soft delete
        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });

        await auditLogService.log({
            adminId,
            actionType: 'DELETE_USER',
            entityType: 'USER',
            entityId: userId,
            ipAddress,
        });

        return user;
    }
    /**
     * Bulk actions
     */
    async bulkAction(userIds: string[], action: 'delete' | 'ban' | 'verify' | 'suspend', adminId: string, ipAddress?: string) {
        if (!userIds || userIds.length === 0) return;

        let updateData: any = {};
        let actionType = '';

        switch (action) {
            case 'delete':
                updateData = { isActive: false };
                actionType = 'BULK_DELETE_USERS';
                break;
            case 'ban':
                updateData = { isBanned: true };
                actionType = 'BULK_BAN_USERS';
                break;
            case 'verify':
                updateData = { emailVerified: true };
                actionType = 'BULK_VERIFY_USERS';
                break;
            case 'suspend':
                // Assuming 7 days for bulk suspend
                updateData = {
                    suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    suspensionReason: 'Bulk suspension via admin panel'
                };
                actionType = 'BULK_SUSPEND_USERS';
                break;
            default:
                throw new Error('Invalid bulk action');
        }

        await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: updateData,
        });

        await auditLogService.log({
            adminId,
            actionType,
            entityType: 'USER',
            entityId: 'BULK',
            details: { userIds, action },
            ipAddress,
        });

        return { count: userIds.length };
    }
}
