/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listing.service';
import { UploadService } from '../services/upload.service';

const listingService = new ListingService();

export class ListingController {
  /** POST /api/v1/listings */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📝 Creating listing request received');
      console.log('Files:', req.files);
      console.log('Body:', req.body);
      
      const userId = req.user!.userId;
      
      // Handle file uploads if any
      const files = req.files as Express.Multer.File[];
      const uploadedPhotoUrls: string[] = [];
      
      if (files && files.length > 0) {
        const uploadService = new UploadService();
        const uploadResults = await uploadService.uploadMultipleImages(files, 'listings');
        uploadedPhotoUrls.push(...uploadResults.map(r => r.url));
      }
      
      const rawBody = req.body;

      // Maps for frontend -> backend enums
      const propertyTypeMap: Record<string, any> = {
        'private': 'PRIVATE_ROOM',
        'shared': 'SHARED_ROOM',
        'entire': 'APARTMENT', // Defaulting entire place to APARTMENT, could be HOUSE
      };

      const data = {
        ...rawBody,
        // Numeric fields (already coerced by validator, but safe to keep Number())
        rent: Number(rawBody.rent),
        deposit: Number(rawBody.deposit || 0),
        bathrooms: rawBody.bathrooms ? Number(rawBody.bathrooms) : undefined,
        leaseLength: rawBody.leaseLength ? Number(rawBody.leaseLength) : undefined,
        latitude: rawBody.latitude ? Number(rawBody.latitude) : undefined,
        longitude: rawBody.longitude ? Number(rawBody.longitude) : undefined,
        ageRangeMin: rawBody.ageRangeMin ? Number(rawBody.ageRangeMin) : undefined,
        ageRangeMax: rawBody.ageRangeMax ? Number(rawBody.ageRangeMax) : undefined,
        
        // Boolean fields - Handle both boolean (from validator) and string (fallback)
        utilitiesIncluded: rawBody.utilitiesIncluded === true || rawBody.utilitiesIncluded === 'true',
        smokingAllowed: rawBody.smokingAllowed === true || rawBody.smokingAllowed === 'true',
        petsAllowed: rawBody.petsAllowed === true || rawBody.petsAllowed === 'true',
        
        // Map roomType to propertyType if not present
        propertyType: rawBody.propertyType || propertyTypeMap[rawBody.roomType] || undefined,

        // Array fields - Already processed by validator but keep safe fallback
        amenities: Array.isArray(rawBody.amenities) ? rawBody.amenities : [],
        occupationPreference: Array.isArray(rawBody.occupationPreference) ? rawBody.occupationPreference : [],
        houseRules: Array.isArray(rawBody.houseRules) ? rawBody.houseRules : [],
        
        // Date fields
        availableFrom: new Date(rawBody.availableFrom),
        availableUntil: rawBody.availableUntil ? new Date(rawBody.availableUntil) : undefined,
        
        // Photos
        photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : (rawBody.photos || []),
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
