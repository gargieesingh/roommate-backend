import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminNotificationsService {
    /**
     * Send notification to users
     */
    async sendNotification(
        data: {
            title: string;
            message: string;
            targetType: string;
            targetValue?: string;
            channel: string;
        },
        adminId: string,
        ipAddress?: string
    ) {
        // Determine recipient user IDs based on target type
        let recipientIds: string[] = [];

        switch (data.targetType) {
            case 'all':
                const allUsers = await prisma.user.findMany({
                    where: { isActive: true, isBanned: false },
                    select: { id: true },
                });
                recipientIds = allUsers.map(u => u.id);
                break;

            case 'verified':
                const verifiedUsers = await prisma.user.findMany({
                    where: {
                        isActive: true,
                        isBanned: false,
                        emailVerified: true,
                    },
                    select: { id: true },
                });
                recipientIds = verifiedUsers.map(u => u.id);
                break;

            case 'city':
                if (data.targetValue) {
                    const cityUsers = await prisma.user.findMany({
                        where: {
                            isActive: true,
                            isBanned: false,
                            city: { contains: data.targetValue, mode: 'insensitive' },
                        },
                        select: { id: true },
                    });
                    recipientIds = cityUsers.map(u => u.id);
                }
                break;

            case 'specific':
                // Expecting comma-separated user IDs in targetValue
                if (data.targetValue) {
                    recipientIds = data.targetValue.split(',').map(id => id.trim());
                }
                break;
        }

        // Create admin notification record
        const adminNotification = await prisma.adminNotification.create({
            data: {
                adminId,
                title: data.title,
                message: data.message,
                targetType: data.targetType,
                recipientIds: recipientIds,
                channel: data.channel,
                sentAt: new Date(),
            },
        });

        // Create individual notifications for each recipient
        if (recipientIds.length > 0) {
            await prisma.notification.createMany({
                data: recipientIds.map(userId => ({
                    userId,
                    type: 'TEAM_INVITE', // Using existing enum, ideally add ADMIN_BROADCAST
                    title: data.title,
                    message: data.message,
                })),
            });
        }

        // Log the action
        await auditLogService.log({
            adminId,
            actionType: 'SEND_NOTIFICATION',
            entityType: 'NOTIFICATION',
            entityId: adminNotification.id,
            details: {
                targetType: data.targetType,
                recipientCount: recipientIds.length,
            },
            ipAddress,
        });

        return {
            notificationId: adminNotification.id,
            recipientCount: recipientIds.length,
        };
    }

    /**
     * Get notification send history
     */
    async getNotificationHistory(params: {
        page?: number;
        limit?: number;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.adminNotification.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.adminNotification.count(),
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
