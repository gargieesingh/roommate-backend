import { z } from 'zod';

/** GET /api/v1/users - Search users */
export const searchUsersSchema = z.object({
  query: z.object({
    // Support both naming conventions (frontend sends minBudget/maxBudget/minAge/maxAge)
    budgetMin: z.string().regex(/^\d+$/).transform(Number).optional(),
    budgetMax: z.string().regex(/^\d+$/).transform(Number).optional(),
    minBudget: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxBudget: z.string().regex(/^\d+$/).transform(Number).optional(),
    ageMin: z.string().regex(/^\d+$/).transform(Number).optional(),
    ageMax: z.string().regex(/^\d+$/).transform(Number).optional(),
    minAge: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxAge: z.string().regex(/^\d+$/).transform(Number).optional(),
    gender: z.string().optional(),
    city: z.string().optional(),
    location: z.string().optional(),
    occupation: z.union([z.string(), z.array(z.string())]).optional(),
    cleanliness: z.string().optional(),
    smokingPreference: z.string().optional(),
    smoking: z.string().optional(),
    drinkingPreference: z.string().optional(),
    petsPreference: z.string().optional(),
    pets: z.string().optional(),
    sleepSchedule: z.string().optional(),
    verifiedOnly: z.string().optional(),
    excludeId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

/** GET /api/v1/users/:id - Get user by ID */
export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

/** POST /api/v1/users/:id/reviews - Create review */
export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().max(500, 'Comment must be 500 characters or fewer').optional(),
  }),
});

/** GET /api/v1/users/:id/reviews - Get user reviews */
export const getUserReviewsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  }),
});
