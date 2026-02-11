import { z } from 'zod';

/** POST /api/v1/listings */
export const createListingSchema = z.object({
  body: z.object({
    // Listing Type & Basic Info
    type: z.enum(['HAVE_ROOM', 'NEED_ROOM']),
    title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be at most 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be at most 1000 characters'),

    // Financial
    rent: z.number().int().positive('Rent must be a positive number'),
    deposit: z.number().int().nonnegative('Deposit must be a non-negative number'),
    currency: z.string().optional(),


    // Location
    city: z.string().min(2, 'City is required'),
    area: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    // Property Details (optional, mainly for HAVE_ROOM)
    propertyType: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM', 'PRIVATE_ROOM']).optional(),
    furnishedStatus: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
    bathrooms: z.number().int().positive().optional(),
    amenities: z.array(z.string()).max(20, 'Maximum 20 amenities allowed').optional(),

    // Preferences
    genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']).optional(),
    occupationPreference: z.array(z.string()).max(10, 'Maximum 10 occupation preferences allowed').optional(),
    smokingAllowed: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),

    // Availability
    availableFrom: z.string().datetime('Invalid date format'),
    availableUntil: z.string().datetime('Invalid date format').optional(),

    // Media
    photos: z.array(z.string().url('Each photo must be a valid URL')).max(8, 'Maximum 8 photos allowed').optional(),
  }),
});

/** PUT /api/v1/listings/:id */
export const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(100).optional(),
    description: z.string().min(20).max(1000).optional(),
    rent: z.number().int().positive().optional(),
    deposit: z.number().int().nonnegative().optional(),
    city: z.string().min(2).optional(),
    area: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    propertyType: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM', 'PRIVATE_ROOM']).optional(),
    furnishedStatus: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
    bathrooms: z.number().int().positive().optional(),
    amenities: z.array(z.string()).max(20).optional(),
    genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']).optional(),
    occupationPreference: z.array(z.string()).max(10).optional(),
    smokingAllowed: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    availableFrom: z.string().datetime().optional(),
    availableUntil: z.string().datetime().optional(),
    photos: z.array(z.string().url()).max(8).optional(),
    isActive: z.boolean().optional(),
  }),
});

/** GET /api/v1/listings/:id */
export const listingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid listing ID format'),
  }),
});

/** GET /api/v1/listings/user/:userId */
export const userIdListingsParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

/** GET /api/v1/listings/search */
export const searchListingsSchema = z.object({
  query: z.object({
    // Required
    city: z.string().min(1, 'City is required'),

    // Filters
    type: z.enum(['HAVE_ROOM', 'NEED_ROOM']).optional(),
    minRent: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    maxRent: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    propertyType: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM', 'PRIVATE_ROOM']).optional(),
    furnishedStatus: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
    genderPreference: z.enum(['MALE', 'FEMALE', 'ANY']).optional(),
    smokingAllowed: z.string().transform((val) => val === 'true').optional(),
    petsAllowed: z.string().transform((val) => val === 'true').optional(),
    availableFrom: z.string().datetime().optional(),

    // Sorting & Pagination
    sortBy: z.enum(['newest', 'price_low', 'price_high', 'popular']).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional(),
  }),
});
