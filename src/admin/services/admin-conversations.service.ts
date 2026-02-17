import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminConversationsService {
    async getConversations(params: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                include: {
                    user1: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    user2: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            content: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            messages: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.conversation.count(),
        ]);

        return {
            conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getConversationById(conversationId: string) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                user1: true,
                user2: true,
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        return conversation;
    }

    async deleteConversation(conversationId: string, adminId: string, ipAddress?: string) {
        await prisma.conversation.delete({ where: { id: conversationId } });

        await auditLogService.log({
            adminId,
            actionType: 'DELETE_CONVERSATION',
            entityType: 'CONVERSATION',
            entityId: conversationId,
            ipAddress,
        });
    }
}
