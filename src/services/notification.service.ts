import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  relatedUserId?: string;
  relatedTeamId?: string;
  relatedListingId?: string;
}

interface GetNotificationsFilters {
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  async createNotification(userId: string, data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });

    return notification;
  }

  /**
   * Get user notifications with filters
   */
  async getNotifications(userId: string, filters: GetNotificationsFilters = {}) {
    const { isRead, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return null;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Delete old read notifications (cleanup utility)
   */
  async deleteOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}
