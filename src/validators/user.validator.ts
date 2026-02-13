import { z } from 'zod';

/** GET /api/v1/users - Search users */
export const searchUsersSchema = z.object({
  query: z.object({
    budgetMin: z.string().regex(/^\d+$/, 'Budget minimum must be a number').transform(Number).optional(),
    budgetMax: z.string().regex(/^\d+$/, 'Budget maximum must be a number').transform(Number).optional(),
    ageMin: z.string().regex(/^\d+$/, 'Age minimum must be a number').transform(Number).optional(),
    ageMax: z.string().regex(/^\d+$/, 'Age maximum must be a number').transform(Number).optional(),
    gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
    city: z.string().optional(),
    occupation: z.string().optional(),
    cleanliness: z.enum(['VERY_CLEAN', 'MODERATELY_CLEAN', 'RELAXED']).optional(),
    smokingPreference: z.enum(['YES', 'NO', 'OCCASIONALLY']).optional(),
    drinkingPreference: z.enum(['YES', 'NO', 'OCCASIONALLY', 'SOCIALLY']).optional(),
    petsPreference: z.enum(['HAS_PETS', 'NO_PETS', 'OPEN_TO_PETS']).optional(),
    sleepSchedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE']).optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
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
