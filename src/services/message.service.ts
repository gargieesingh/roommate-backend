import prisma from '../config/database';
import logger from '../config/logger';

/** Fields returned for conversation list */
const CONVERSATION_SELECT = {
  id: true,
  user1Id: true,
  user2Id: true,
  listingId: true,
  createdAt: true,
  updatedAt: true,
  user1: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
    },
  },
  user2: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
    },
  },
  listing: {
    select: {
      id: true,
      title: true,
      type: true,
      city: true,
      rent: true,
    },
  },
} as const;

/** Fields returned for messages */
const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderId: true,
  content: true,
  isRead: true,
  readAt: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
    },
  },
} as const;

export class MessageService {
  /**
   * Send a message to another user
   * Creates conversation if it doesn't exist
   */
  async sendMessage(
    senderId: string,
    data: {
      receiverId: string;
      content: string;
      listingId?: string;
    }
  ) {
    const { receiverId, content, listingId } = data;

    // Ensure user1Id is always the smaller UUID (for unique constraint)
    const [user1Id, user2Id] = [senderId, receiverId].sort();

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id,
          user2Id,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
          listingId,
        },
      });
      logger.info(`New conversation created: ${conversation.id}`);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
      },
      select: MESSAGE_SELECT,
    });

    logger.info(`Message sent: ${message.id} in conversation ${conversation.id}`);

    return { message, conversationId: conversation.id };
  }

  /**
   * Get all conversations for a user with last message and unread count
   */
  async getConversations(userId: string, page: number = 1, limit: number = 20) {
    // Ensure page and limit are numbers
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    // Get conversations where user is participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: {
        ...CONVERSATION_SELECT,
        messages: {
          select: MESSAGE_SELECT,
          orderBy: { createdAt: 'desc' },
          take: 1, // Get last message
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limitNum,
    });

    // Get total count
    const total = await prisma.conversation.count({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        return {
          ...conv,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          messages: undefined, // Remove messages array from response
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string, userId: string) {
    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      const error = new Error('Conversation not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      const error = new Error('You do not have access to this conversation') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      select: MESSAGE_SELECT,
      orderBy: { createdAt: 'asc' },
    });

    return { messages, conversation };
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      const error = new Error('Message not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    // Verify user is the receiver (not the sender)
    const conversation = message.conversation;
    const isParticipant = conversation.user1Id === userId || conversation.user2Id === userId;
    const isSender = message.senderId === userId;

    if (!isParticipant) {
      const error = new Error('You do not have access to this message') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    if (isSender) {
      const error = new Error('Cannot mark your own message as read') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      select: MESSAGE_SELECT,
    });

    logger.info(`Message marked as read: ${messageId}`);

    return updatedMessage;
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string) {
    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      const error = new Error('Conversation not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      const error = new Error('You do not have access to this conversation') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    // Mark all unread messages from the other user as read
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info(`Marked ${result.count} messages as read in conversation ${conversationId}`);

    return { count: result.count };
  }

  /**
   * Get total unread message count for user
   */
  async getUnreadCount(userId: string) {
    // Get all conversations where user is participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { id: true },
    });

    const conversationIds = conversations.map((c) => c.id);

    // Count unread messages from other users
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return { unreadCount };
  }
}
