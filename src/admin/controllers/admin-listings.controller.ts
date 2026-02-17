/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { AdminListingsService } from '../services/admin-listings.service';

const adminListingsService = new AdminListingsService();

export class AdminListingsController {
    async getListings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminListingsService.getListings({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
                type: req.query.type as string,
                status: req.query.status as string,
                city: req.query.city as string,
                minRent: req.query.minRent ? parseInt(req.query.minRent as string) : undefined,
                maxRent: req.query.maxRent ? parseInt(req.query.maxRent as string) : undefined,
                isFlagged: req.query.isFlagged === 'true' ? true : req.query.isFlagged === 'false' ? false : undefined,
            });

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getListingById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const listing = await adminListingsService.getListingById(req.params.id);

            res.json({
                success: true,
                data: { listing },
            });
        } catch (error) {
            next(error);
        }
    }

    async updateListing(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const listing = await adminListingsService.updateListing(req.params.id, req.body, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Listing updated successfully',
                data: { listing },
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleListingStatus(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const listing = await adminListingsService.toggleListingStatus(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Listing status toggled successfully',
                data: { listing },
            });
        } catch (error) {
            next(error);
        }
    }

    async flagListing(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { reason } = req.body;
            const listing = await adminListingsService.flagListing(req.params.id, reason, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Listing flagged successfully',
                data: { listing },
            });
        } catch (error) {
            next(error);
        }
    }

    async unflagListing(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const listing = await adminListingsService.unflagListing(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Listing unflagged successfully',
                data: { listing },
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteListing(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminListingsService.deleteListing(req.params.id, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Listing deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    async bulkAction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { listingIds, action } = req.body;

            const result = await adminListingsService.bulkAction(listingIds, action, adminId, ipAddress);

            res.json({
                success: true,
                message: 'Bulk action completed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
