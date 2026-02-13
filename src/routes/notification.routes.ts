import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  getNotificationsSchema,
  notificationIdParamSchema,
} from '../validators/notification.validator';

const router = Router();
const notificationController = new NotificationController();

// ─── All routes require authentication ─────────────────────

/** GET /api/v1/notifications/unread-count - Get unread count */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount.bind(notificationController)
);

/** GET /api/v1/notifications - Get user notifications */
router.get(
  '/',
  authenticate,
  validate(getNotificationsSchema),
  notificationController.getNotifications.bind(notificationController)
);

/** PUT /api/v1/notifications/read-all - Mark all as read */
router.put(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

/** PUT /api/v1/notifications/:id/read - Mark notification as read */
router.put(
  '/:id/read',
  authenticate,
  validate(notificationIdParamSchema),
  notificationController.markAsRead.bind(notificationController)
);

export default router;
