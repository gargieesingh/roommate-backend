import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminReviewsService {
    async getReviews(params: {
        page?: number;
        limit?: number;
        minRating?: number;
        maxRating?: number;
        isHidden?: boolean;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.minRating) {
            where.rating = { ...where.rating, gte: params.minRating };
        }

        if (params.maxRating) {
            where.rating = { ...where.rating, lte: params.maxRating };
        }

        if (params.isHidden !== undefined) {
            where.isHidden = params.isHidden;
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    reviewed: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.review.count({ where }),
        ]);

        return {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async hideReview(reviewId: string, adminId: string, ipAddress?: string) {
        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { isHidden: true },
        });

        await auditLogService.log({
            adminId,
            actionType: 'HIDE_REVIEW',
            entityType: 'REVIEW',
            entityId: reviewId,
            ipAddress,
        });

        return review;
    }

    async showReview(reviewId: string, adminId: string, ipAddress?: string) {
        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { isHidden: false },
        });

        await auditLogService.log({
            adminId,
            actionType: 'SHOW_REVIEW',
            entityType: 'REVIEW',
            entityId: reviewId,
            ipAddress,
        });

        return review;
    }

    async deleteReview(reviewId: string, adminId: string, ipAddress?: string) {
        await prisma.review.delete({ where: { id: reviewId } });

        await auditLogService.log({
            adminId,
            actionType: 'DELETE_REVIEW',
            entityType: 'REVIEW',
            entityId: reviewId,
            ipAddress,
        });
    }
}
