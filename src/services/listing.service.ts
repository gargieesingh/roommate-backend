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

    // Extract photos from data to handle listingPhotos table separately
    const { photos, ...listingData } = data as any;

    const listing = await prisma.$transaction(async (tx) => {
      // Update scalar listing fields
      const updated = await tx.listing.update({
        where: { id },
        data: photos ? { ...listingData, photos } : listingData,
        select: LISTING_SELECT,
      });

      // If photos were provided, sync the listingPhotos join table
      // (the frontend mapper prefers listingPhotos over the photos[] column)
      if (photos && Array.isArray(photos)) {
        // Delete all existing photo records for this listing
        await tx.listingPhoto.deleteMany({ where: { listingId: id } });

        // Re-insert from the new photos array
        if (photos.length > 0) {
          await tx.listingPhoto.createMany({
            data: photos.map((url: string, index: number) => ({
              listingId: id,
              url,
              fileKey: url.startsWith('data:') ? `base64-${index}` : url,
              order: index,
            })),
          });
        }

        // Re-fetch with fresh listingPhotos
        return tx.listing.findUnique({
          where: { id },
          select: LISTING_SELECT,
        });
      }

      return updated;
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
   * Get all listings by a specific user (excludes soft-deleted)
   */
  async getUserListings(userId: string) {
    const listings = await prisma.listing.findMany({
      where: { userId, isActive: true },
      select: LISTING_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return listings;
  }

  /**
   * Get current user's listings (excludes soft-deleted)
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
    minRent?: number | string;
    maxRent?: number | string;
    propertyType?: PropertyType | string;
    roomType?: string | string[];
    furnishedStatus?: FurnishedStatus;
    genderPreference?: GenderPreference | string;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    amenities?: string | string[];
    leaseLength?: number | string;
    availableFrom?: Date;
    verifiedOnly?: boolean | string;
    sortBy?: string;
    page?: number | string;
    limit?: number | string;
  }) {
    logger.info(`searchListings called with filters: ${JSON.stringify(filters)}`);

    const {
      city,
      type,
      minRent,
      maxRent,
      propertyType,
      roomType,
      furnishedStatus,
      genderPreference,
      smokingAllowed,
      petsAllowed,
      amenities,
      leaseLength,
      availableFrom,
      verifiedOnly,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    // ── Pagination ──────────────────────────────────────────────────────────
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : (page as number);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit as number);
    const skip = (pageNum - 1) * limitNum;

    // ── Room-type → PropertyType map ─────────────────────────────────────────
    const roomTypeEnumMap: Record<string, PropertyType> = {
      private: 'PRIVATE_ROOM',
      shared: 'SHARED_ROOM',
      entire: 'APARTMENT',
      PRIVATE_ROOM: 'PRIVATE_ROOM',
      SHARED_ROOM: 'SHARED_ROOM',
      APARTMENT: 'APARTMENT',
      HOUSE: 'HOUSE',
      STUDIO: 'STUDIO',
    };

    // ── Collect all AND conditions ────────────────────────────────────────────
    const andConditions: any[] = [{ isActive: true }];

    // City
    if (city) andConditions.push({ city: { contains: city, mode: 'insensitive' } });

    // Listing type
    if (type) andConditions.push({ type });

    // Furnished status
    if (furnishedStatus) andConditions.push({ furnishedStatus });

    // ── Room type: match on EITHER propertyType enum OR roomType string ───────
    if (roomType || propertyType) {
      const requested = roomType
        ? (Array.isArray(roomType) ? roomType : String(roomType).split(','))
        : [String(propertyType)];

      const enumVals: PropertyType[] = requested
        .map((t) => roomTypeEnumMap[t.trim()])
        .filter(Boolean) as PropertyType[];

      const strVals: string[] = requested.map((t) => t.trim().toLowerCase());

      const roomTypeOr: any[] = [];
      if (enumVals.length) roomTypeOr.push({ propertyType: { in: enumVals } });
      if (strVals.length) roomTypeOr.push({ roomType: { in: strVals } });

      if (roomTypeOr.length) andConditions.push({ OR: roomTypeOr });
    }

    // ── Gender preference ────────────────────────────────────────────────────
    if (genderPreference) {
      const gp = String(genderPreference).toUpperCase();
      if (gp !== 'ANY') andConditions.push({ genderPreference: gp });
    }

    // ── Booleans ─────────────────────────────────────────────────────────────
    if (smokingAllowed !== undefined) andConditions.push({ smokingAllowed });
    if (petsAllowed !== undefined) andConditions.push({ petsAllowed });

    // ── Rent range ────────────────────────────────────────────────────────────
    const minRentNum = minRent !== undefined && minRent !== '' ? Number(minRent) : undefined;
    const maxRentNum = maxRent !== undefined && maxRent !== '' ? Number(maxRent) : undefined;
    if (minRentNum !== undefined && minRentNum > 0) {
      andConditions.push({ rent: { gte: minRentNum } });
    }
    if (maxRentNum !== undefined && maxRentNum > 0 && maxRentNum < 1_000_000) {
      andConditions.push({ rent: { lte: maxRentNum } });
    }

    // ── Lease length ──────────────────────────────────────────────────────────
    if (leaseLength !== undefined && leaseLength !== '') {
      const leaseLengthNum = Number(leaseLength);
      if (!isNaN(leaseLengthNum) && leaseLengthNum > 0) {
        andConditions.push({ leaseLength: { lte: leaseLengthNum } });
      }
    }

    // ── Amenities (hasSome — listing must contain at least one of the requested) ─
    if (amenities) {
      const amenityList = Array.isArray(amenities)
        ? amenities.flatMap((a) => String(a).split(','))
        : String(amenities).split(',');
      const trimmed = amenityList.map((a) => a.trim()).filter(Boolean);
      if (trimmed.length > 0) {
        andConditions.push({ amenities: { hasSome: trimmed } });
      }
    }

    // ── Available from ────────────────────────────────────────────────────────
    if (availableFrom) andConditions.push({ availableFrom: { lte: availableFrom } });

    // ── Verified only ─────────────────────────────────────────────────────────
    if (verifiedOnly === true || verifiedOnly === 'true') {
      andConditions.push({ user: { phoneVerified: true } });
    }

    // ── Sorting ────────────────────────────────────────────────────────────────
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_low') orderBy = { rent: 'asc' };
    if (sortBy === 'price_high') orderBy = { rent: 'desc' };
    if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

    // ── Build final where from AND conditions ─────────────────────────────────
    const where = andConditions.length === 1
      ? andConditions[0]
      : { AND: andConditions };

    logger.info(`Prisma where clause: ${JSON.stringify(where)}`);

    // ── Execute ────────────────────────────────────────────────────────────────
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({ where, select: LISTING_SELECT, orderBy, skip, take: limitNum }),
      prisma.listing.count({ where }),
    ]);

    logger.info(`searchListings result: ${total} listings found`);

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

