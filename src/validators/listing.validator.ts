import { z } from 'zod';

/** POST /api/v1/listings */
export const createListingSchema = z.object({
  body: z.object({
    // Listing Type & Basic Info
    type: z.enum(['HAVE_ROOM', 'NEED_ROOM']).default('HAVE_ROOM'),
    title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be at most 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be at most 1000 characters'),

    // Financial
    rent: z.coerce.number().int().positive('Rent must be a positive number'),
    deposit: z.coerce.number().int().nonnegative('Deposit must be a non-negative number').optional().default(0),
    currency: z.string().default('INR'), // Default to INR if missing

    // Lease & Utilities (Frontend sends these)
    leaseLength: z.coerce.number().positive().optional(),
    utilitiesIncluded: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),

    // Room Type (Frontend sends this)
    roomType: z.enum(['private', 'shared', 'entire']).optional(),

    // Location
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(), // Frontend sends state
    zipCode: z.string().optional(), // Frontend sends zipCode
    area: z.string().optional(),
    address: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),

    // Property Details (optional, mainly for HAVE_ROOM)
    propertyType: z.enum(['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM', 'PRIVATE_ROOM']).optional(),
    furnishedStatus: z.enum(['FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']).optional(),
    bathrooms: z.coerce.number().int().positive().optional(),

    // Arrays - Handle single string or array of strings from FormData
    amenities: z.preprocess(
      (val) => (Array.isArray(val) ? val : val ? [val] : []),
      z.array(z.string())
    ).optional(),

    // Preferences
    genderPreference: z.string()
      .transform(val => val.toUpperCase()) // Handle 'any' -> 'ANY'
      .pipe(z.enum(['MALE', 'FEMALE', 'ANY']))
      .optional(),

    occupationPreference: z.preprocess(
      (val) => (Array.isArray(val) ? val : val ? [val] : []),
      z.array(z.string())
    ).optional(),

    smokingAllowed: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
    petsAllowed: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),

    // Additional Preferences
    ageRangeMin: z.coerce.number().int().min(18).max(100).optional(),
    ageRangeMax: z.coerce.number().int().min(18).max(100).optional(),
    houseRules: z.preprocess(
      (val) => (Array.isArray(val) ? val : val ? [val] : []),
      z.array(z.string())
    ).optional(),

    // Availability
    availableFrom: z.coerce.date(), // Zod handles date string to Date object
    availableUntil: z.coerce.date().optional(),

    // Media
    photos: z.preprocess(
      (val) => (Array.isArray(val) ? val : val ? [val] : []),
      z.array(z.string().url('Each photo must be a valid URL'))
    ).optional(),
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
    ageRangeMin: z.coerce.number().int().min(18).max(100).optional(),
    ageRangeMax: z.coerce.number().int().min(18).max(100).optional(),
    houseRules: z.array(z.string()).max(20).optional(),
    smokingAllowed: z.boolean().optional(),
    petsAllowed: z.boolean().optional(),
    availableFrom: z.coerce.date().optional(),
    availableUntil: z.coerce.date().optional(),
    photos: z.array(z.string().min(1)).max(8).optional(),
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
    // Optional - if not provided, return all listings
    city: z.string().min(1).optional(),

    // Filters
    type: z.enum(['HAVE_ROOM', 'NEED_ROOM']).optional(),
    minRent: z.coerce.number().int().positive().optional(),
    maxRent: z.coerce.number().int().positive().optional(),
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
