import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminReportsService {
    async getReports(params: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        search?: string;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.status) {
            where.status = params.status.toUpperCase();
        }

        if (params.type === 'user') {
            where.reportedUserId = { not: null };
        } else if (params.type === 'listing') {
            where.reportedListingId = { not: null };
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                include: {
                    reporter: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    reportedListing: {
                        select: {
                            id: true,
                            title: true,
                            city: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.report.count({ where }),
        ]);

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getReportById(reportId: string) {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                reporter: true,
                reportedUser: true,
                reportedListing: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        if (!report) {
            throw new Error('Report not found');
        }

        return report;
    }

    async updateReportStatus(
        reportId: string,
        status: string,
        notes: string,
        adminId: string,
        ipAddress?: string
    ) {
        const report = await prisma.report.update({
            where: { id: reportId },
            data: {
                status: status.toUpperCase() as any,
            },
        });

        await auditLogService.log({
            adminId,
            actionType: 'UPDATE_REPORT_STATUS',
            entityType: 'REPORT',
            entityId: reportId,
            details: { status, notes },
            ipAddress,
        });

        // If resolved with action, take action on the reported entity
        if (status === 'RESOLVED' && report.reportedUserId) {
            // Could trigger ban/suspension here based on notes
            // For now, just log the resolution
        }

        return report;
    }
}
