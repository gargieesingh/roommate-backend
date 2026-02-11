/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listing.service';

const listingService = new ListingService();

export class ListingController {
  /** POST /api/v1/listings */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data = {
        ...req.body,
        availableFrom: new Date(req.body.availableFrom),
        availableUntil: req.body.availableUntil ? new Date(req.body.availableUntil) : undefined,
      };

      const listing = await listingService.createListing(userId, data);

      res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: { listing },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/listings/:id */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const listing = await listingService.getListingById(id as string);

      res.json({
        success: true,
        data: { listing },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/listings/:id */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const data = {
        ...req.body,
        availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : undefined,
        availableUntil: req.body.availableUntil ? new Date(req.body.availableUntil) : undefined,
      };

      const listing = await listingService.updateListing(id as string, userId, data);

      res.json({
        success: true,
        message: 'Listing updated successfully',
        data: { listing },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/listings/:id */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await listingService.deleteListing(id as string, userId);

      res.json({
        success: true,
        message: 'Listing deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/listings/user/:userId */
  async getUserListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const listings = await listingService.getUserListings(userId as string);

      res.json({
        success: true,
        data: { listings, count: listings.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/listings/my-listings */
  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const listings = await listingService.getMyListings(userId);

      res.json({
        success: true,
        data: { listings, count: listings.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/listings/search */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        ...req.query,
        availableFrom: req.query.availableFrom ? new Date(req.query.availableFrom as string) : undefined,
      };

      const result = await listingService.searchListings(filters as any);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
