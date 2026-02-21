import { z } from 'zod';

/** POST /api/v1/upload/presigned-url */
export const presignedUrlSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('listingId must be a valid UUID'),
    filename: z.string().min(1, 'filename is required').max(255, 'filename must be at most 255 characters'),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
      message: 'contentType must be image/jpeg, image/png, or image/webp',
    }),
  }),
});

/** POST /api/v1/upload/confirm */
export const confirmUploadSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('listingId must be a valid UUID'),
    fileKey: z.string().min(1, 'fileKey is required'),
  }),
});
