import prisma from '../config/database';
import { ListingType, PropertyType, FurnishedStatus, GenderPreference, Prisma } from '@prisma/client';
import logger from '../config/logger';

/** Fields returned in listing responses */
const LISTING_SELECT: Prisma.ListingSelect = {
  id: true,
  userId: true,
  type: true,
  title: true,
  description: true,
  rent: true,
  deposit: true,
  currency: true,
  city: true,
  area: true,
  address: true,
  latitude: true,
  longitude: true,
  propertyType: true,
  furnishedStatus: true,
  bathrooms: true,
  amenities: true,
  genderPreference: true,
  occupationPreference: true,
  smokingAllowed: true,
  petsAllowed: true,
  ageRangeMin: true,
  ageRangeMax: true,
  houseRules: true,
  availableFrom: true,
  availableUntil: true,
  leaseLength: true,
  utilitiesIncluded: true,
  roomType: true,
  state: true,
  zipCode: true,
  photos: true,
  isActive: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePhoto: true,
      phoneVerified: true,
    },
  },
  listingPhotos: {
    orderBy: { order: 'asc' },
  },
};

export class ListingService {
  /**
   * Create a new listing
   */
  async createListing(
    userId: string,
    data: {
      type: ListingType;
      title: string;
      description: string;
      rent: number;
      deposit: number;
      currency?: string;
      city: string;
      area?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      propertyType?: PropertyType;
      furnishedStatus?: FurnishedStatus;
      bathrooms?: number;
      amenities?: string[];
      genderPreference?: GenderPreference;
      occupationPreference?: string[];
      smokingAllowed?: boolean;
      petsAllowed?: boolean;
      ageRangeMin?: number;
      ageRangeMax?: number;
      houseRules?: string[];
      availableFrom: Date;
      availableUntil?: Date;
      photos?: string[];
      leaseLength?: number;
      utilitiesIncluded?: boolean;
      roomType?: string;
      state?: string;
      zipCode?: string;
    }
  ) {
    const listing = await prisma.listing.create({
      data: {
        userId,
        ...data,
      },
      select: LISTING_SELECT,
    });

    logger.info(`Listing created: ${listing.id} by user ${userId}`);

    return listing;
  }

  /**
   * Get listing by ID and increment view count
   */
  async getListingById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: LISTING_SELECT,
    });

    if (!listing) {
      const error = new Error('Listing not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    // Increment view count asynchronously (don't wait)
    prisma.listing
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err: Error) => logger.error('Failed to increment view count:', err));

    return listing;
  }

  /**
   * Update listing (only owner can update)
   */
  async updateListing(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      rent?: number;
      deposit?: number;
      city?: string;
      area?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      propertyType?: PropertyType;
      furnishedStatus?: FurnishedStatus;
      bathrooms?: number;
      amenities?: string[];
      genderPreference?: GenderPreference;
      occupationPreference?: string[];
      smokingAllowed?: boolean;
      petsAllowed?: boolean;
      ageRangeMin?: number;
      ageRangeMax?: number;
      houseRules?: string[];
      availableFrom?: Date;
      availableUntil?: Date;
      photos?: string[];
      leaseLength?: number;
      utilitiesIncluded?: boolean;
      roomType?: string;
      state?: string;
      zipCode?: string;
      isActive?: boolean;
    }
  ) {
    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      const error = new Error('Listing not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error = new Error('You do not have permission to update this listing') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data,
      select: LISTING_SELECT,
    });

    logger.info(`Listing updated: ${id} by user ${userId}`);

    return listing;
  }

  /**
   * Delete listing (soft delete - set isActive to false)
   */
  async deleteListing(id: string, userId: string) {
    // Check ownership
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      const error = new Error('Listing not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (existing.userId !== userId) {
      const error = new Error('You do not have permission to delete this listing') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    await prisma.listing.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`Listing deleted (soft): ${id} by user ${userId}`);

    return { success: true };
  }

  /**
   * Get all listings by a specific user
   */
  async getUserListings(userId: string) {
    const listings = await prisma.listing.findMany({
      where: { userId },
      select: LISTING_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return listings;
  }

  /**
   * Get current user's listings
   */
  async getMyListings(userId: string) {
    return this.getUserListings(userId);
  }

  /**
   * Search listings with filters and pagination
   */
  async searchListings(filters: {
    city?: string;
    type?: ListingType;
    minRent?: number;
    maxRent?: number;
    propertyType?: PropertyType;
    furnishedStatus?: FurnishedStatus;
    genderPreference?: GenderPreference;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    availableFrom?: Date;
    sortBy?: 'newest' | 'price_low' | 'price_high' | 'popular';
    page?: number;
    limit?: number;
  }) {
    const {
      city,
      type,
      minRent,
      maxRent,
      propertyType,
      furnishedStatus,
      genderPreference,
      smokingAllowed,
      petsAllowed,
      availableFrom,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (city) where.city = { contains: city, mode: 'insensitive' };

    if (type) where.type = type;
    if (propertyType) where.propertyType = propertyType;
    if (furnishedStatus) where.furnishedStatus = furnishedStatus;
    if (genderPreference) where.genderPreference = genderPreference;
    if (smokingAllowed !== undefined) where.smokingAllowed = smokingAllowed;
    if (petsAllowed !== undefined) where.petsAllowed = petsAllowed;

    // Rent range filter
    if (minRent || maxRent) {
      where.rent = {};
      // Convert to numbers if they're strings
      if (minRent) where.rent.gte = typeof minRent === 'string' ? parseInt(minRent, 10) : minRent;
      if (maxRent) where.rent.lte = typeof maxRent === 'string' ? parseInt(maxRent, 10) : maxRent;
    }

    // Available from filter
    if (availableFrom) {
      where.availableFrom = { lte: availableFrom };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' }; // Default: newest
    if (sortBy === 'price_low') orderBy = { rent: 'asc' };
    if (sortBy === 'price_high') orderBy = { rent: 'desc' };
    if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

    // Pagination
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: LISTING_SELECT,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
