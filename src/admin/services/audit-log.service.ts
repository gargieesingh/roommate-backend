import prisma from '../../config/database';

export interface AuditLogData {
    adminId: string;
    actionType: string;
    entityType: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
}

export class AuditLogService {
    /**
     * Create an audit log entry for an admin action.
     * This is append-only and should never be updated or deleted.
     */
    async log(data: AuditLogData): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    adminId: data.adminId,
                    actionType: data.actionType,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    details: data.details || {},
                    ipAddress: data.ipAddress,
                },
            });
        } catch (error) {
            // Log the error but don't throw - audit logging should not break the main operation
            console.error('Failed to create audit log:', error);
        }
    }

    /**
     * Get audit logs with pagination and filtering.
     */
    async getAuditLogs(params: {
        page?: number;
        limit?: number;
        adminId?: string;
        actionType?: string;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.adminId) {
            where.adminId = params.adminId;
        }

        if (params.actionType) {
            where.actionType = params.actionType;
        }

        if (params.entityType) {
            where.entityType = params.entityType;
        }

        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate) {
                where.createdAt.gte = params.startDate;
            }
            if (params.endDate) {
                where.createdAt.lte = params.endDate;
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
