import { z } from 'zod';

/** POST /api/v1/safety/block */
export const blockUserSchema = z.object({
  body: z.object({
    blockedId: z.string().uuid('Invalid user ID format'),
  }),
});

/** DELETE /api/v1/safety/block/:userId */
export const unblockUserParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

/** POST /api/v1/safety/report */
export const createReportSchema = z.object({
  body: z.object({
    reportedUserId: z.string().uuid('Invalid user ID format').optional(),
    reportedListingId: z.string().uuid('Invalid listing ID format').optional(),
    reason: z.enum(['SPAM', 'INAPPROPRIATE_CONTENT', 'FAKE_LISTING', 'SCAM', 'HARASSMENT', 'OTHER']),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  }).refine(
    (data) => data.reportedUserId || data.reportedListingId,
    { message: 'Either reportedUserId or reportedListingId must be provided' }
  ),
});

/** POST /api/v1/favorites/add */
export const addFavoriteSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('Invalid listing ID format'),
  }),
});

/** DELETE /api/v1/favorites/:listingId */
export const removeFavoriteParamSchema = z.object({
  params: z.object({
    listingId: z.string().uuid('Invalid listing ID format'),
  }),
});
