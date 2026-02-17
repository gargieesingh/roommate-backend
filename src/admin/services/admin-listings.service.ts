import prisma from '../../config/database';
import { AuditLogService } from './audit-log.service';

const auditLogService = new AuditLogService();

export class AdminListingsService {
    async getListings(params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        status?: string;
        city?: string;
        minRent?: number;
        maxRent?: number;
        isFlagged?: boolean;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
                { city: { contains: params.search, mode: 'insensitive' } },
            ];
        }

        if (params.type) {
            where.type = params.type;
        }

        if (params.status === 'active') {
            where.isActive = true;
        } else if (params.status === 'inactive') {
            where.isActive = false;
        }

        if (params.city) {
            where.city = { contains: params.city, mode: 'insensitive' };
        }

        if (params.minRent) {
            where.rent = { ...where.rent, gte: params.minRent };
        }

        if (params.maxRent) {
            where.rent = { ...where.rent, lte: params.maxRent };
        }

        if (params.isFlagged !== undefined) {
            where.isFlagged = params.isFlagged;
        }

        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePhoto: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.listing.count({ where }),
        ]);

        return {
            listings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getListingById(listingId: string) {
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        profilePhoto: true,
                    },
                },
                reports: {
                    include: {
                        reporter: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
        });

        if (!listing) {
            throw new Error('Listing not found');
        }

        return listing;
    }

    async updateListing(listingId: string, data: any, adminId: string, ipAddress?: string) {
        const listing = await prisma.listing.update({
            where: { id: listingId },
            data,
        });

        await auditLogService.log({
            adminId,
            actionType: 'UPDATE_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            details: { changes: data },
            ipAddress,
        });

        return listing;
    }

    async toggleListingStatus(listingId: string, adminId: string, ipAddress?: string) {
        const listing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing) throw new Error('Listing not found');

        const updated = await prisma.listing.update({
            where: { id: listingId },
            data: { isActive: !listing.isActive },
        });

        await auditLogService.log({
            adminId,
            actionType: 'TOGGLE_LISTING_STATUS',
            entityType: 'LISTING',
            entityId: listingId,
            details: { newStatus: updated.isActive },
            ipAddress,
        });

        return updated;
    }

    async flagListing(listingId: string, reason: string, adminId: string, ipAddress?: string) {
        const listing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                isFlagged: true,
                flagReason: reason,
            },
        });

        await auditLogService.log({
            adminId,
            actionType: 'FLAG_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            details: { reason },
            ipAddress,
        });

        return listing;
    }

    async unflagListing(listingId: string, adminId: string, ipAddress?: string) {
        const listing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                isFlagged: false,
                flagReason: null,
            },
        });

        await auditLogService.log({
            adminId,
            actionType: 'UNFLAG_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            ipAddress,
        });

        return listing;
    }

    async deleteListing(listingId: string, adminId: string, ipAddress?: string) {
        await prisma.listing.delete({ where: { id: listingId } });

        await auditLogService.log({
            adminId,
            actionType: 'DELETE_LISTING',
            entityType: 'LISTING',
            entityId: listingId,
            ipAddress,
        });
    }
    async bulkAction(listingIds: string[], action: 'delete' | 'flag' | 'approve' | 'reject', adminId: string, ipAddress?: string) {
        if (!listingIds || listingIds.length === 0) return;

        let actionType = '';

        if (action === 'delete') {
            await prisma.listing.deleteMany({
                where: { id: { in: listingIds } }
            });
            actionType = 'BULK_DELETE_LISTINGS';
        } else {
            let updateData: any = {};

            switch (action) {
                case 'flag':
                    updateData = { isFlagged: true };
                    actionType = 'BULK_FLAG_LISTINGS';
                    break;
                case 'approve':
                    updateData = { isActive: true, status: 'active' }; // Assuming status field exists or isActive matches
                    actionType = 'BULK_APPROVE_LISTINGS';
                    break;
                case 'reject':
                    updateData = { isActive: false, status: 'rejected' };
                    actionType = 'BULK_REJECT_LISTINGS';
                    break;
                default:
                    throw new Error('Invalid bulk action');
            }

            await prisma.listing.updateMany({
                where: { id: { in: listingIds } },
                data: updateData,
            });
        }

        await auditLogService.log({
            adminId,
            actionType,
            entityType: 'LISTING',
            entityId: 'BULK',
            details: { listingIds, action },
            ipAddress,
        });

        return { count: listingIds.length };
    }
}
