import { z } from 'zod';

/** GET /api/v1/notifications - Get notifications */
export const getNotificationsSchema = z.object({
  query: z.object({
    isRead: z.string().regex(/^(true|false)$/, 'isRead must be true or false').transform((val) => val === 'true').optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  }),
});

/** PUT /api/v1/notifications/:id/read - Mark as read */
export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID format'),
  }),
});
