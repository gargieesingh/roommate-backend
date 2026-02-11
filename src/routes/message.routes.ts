import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  sendMessageSchema,
  conversationIdParamSchema,
  messageIdParamSchema,
  conversationsQuerySchema,
} from '../validators/message.validator';

const router = Router();
const messageController = new MessageController();

// ─── All routes require authentication ─────────────────────────

/** POST /api/v1/messages/send - Send a message */
router.post(
  '/send',
  authenticate,
  validate(sendMessageSchema),
  messageController.send.bind(messageController)
);

/** GET /api/v1/messages/conversations - Get all conversations */
router.get(
  '/conversations',
  authenticate,
  validate(conversationsQuerySchema),
  messageController.getConversations.bind(messageController)
);

/** GET /api/v1/messages/conversation/:conversationId - Get messages in a conversation */
router.get(
  '/conversation/:conversationId',
  authenticate,
  validate(conversationIdParamSchema),
  messageController.getConversationMessages.bind(messageController)
);

/** PUT /api/v1/messages/:messageId/read - Mark single message as read */
router.put(
  '/:messageId/read',
  authenticate,
  validate(messageIdParamSchema),
  messageController.markAsRead.bind(messageController)
);

/** PUT /api/v1/messages/conversation/:conversationId/read - Mark all messages in conversation as read */
router.put(
  '/conversation/:conversationId/read',
  authenticate,
  validate(conversationIdParamSchema),
  messageController.markConversationAsRead.bind(messageController)
);

/** GET /api/v1/messages/unread-count - Get total unread message count */
router.get(
  '/unread-count',
  authenticate,
  messageController.getUnreadCount.bind(messageController)
);

export default router;
