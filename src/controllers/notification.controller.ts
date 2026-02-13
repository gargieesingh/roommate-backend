import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError } from '../utils/errors';

const notificationService = new NotificationService();

export class NotificationController {
  /** GET /api/v1/notifications - Get user notifications */
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const filters = req.query;
      const result = await notificationService.getNotifications(userId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/notifications/:id/read - Mark notification as read */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: { notification },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/notifications/read-all - Mark all notifications as read */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/notifications/unread-count - Get unread count */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}
