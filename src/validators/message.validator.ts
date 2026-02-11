import { z } from 'zod';

/** POST /api/v1/messages/send */
export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Invalid receiver ID format'),
    content: z.string().min(1, 'Message content is required').max(1000, 'Message must be at most 1000 characters'),
    listingId: z.string().uuid('Invalid listing ID format').optional(), // Optional context
  }),
});

/** GET /api/v1/messages/conversation/:conversationId */
export const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID format'),
  }),
});

/** PUT /api/v1/messages/:messageId/read */
export const messageIdParamSchema = z.object({
  params: z.object({
    messageId: z.string().uuid('Invalid message ID format'),
  }),
});

/** GET /api/v1/messages/conversations - Query params for pagination */
export const conversationsQuerySchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional(),
  }),
});
