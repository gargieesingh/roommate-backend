/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';

const messageService = new MessageService();

export class MessageController {
  /** POST /api/v1/messages/send */
  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const senderId = req.user!.userId;
      const { receiverId, content, listingId } = req.body;

      const result = await messageService.sendMessage(senderId, {
        receiverId,
        content,
        listingId,
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/messages/conversations */
  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      const result = await messageService.getConversations(userId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/messages/conversation/:conversationId */
  async getConversationMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;

      const result = await messageService.getConversationMessages(conversationId as string, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/messages/:messageId/read */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { messageId } = req.params;

      const message = await messageService.markMessageAsRead(messageId as string, userId);

      res.json({
        success: true,
        message: 'Message marked as read',
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/messages/conversation/:conversationId/read */
  async markConversationAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;

      const result = await messageService.markConversationAsRead(conversationId as string, userId);

      res.json({
        success: true,
        message: `Marked ${result.count} messages as read`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/messages/unread-count */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await messageService.getUnreadCount(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
