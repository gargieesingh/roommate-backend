import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import prisma from '../config/database';
import { r2Client } from '../config/r2';
import { env } from '../config/env';
import logger from '../config/logger';
import { AppError, createForbiddenError, createNotFoundError } from '../utils/errors';

/** Allowed MIME types and their file extensions */
const CONTENT_TYPE_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_PHOTOS = 6;

export class UploadService {
  /**
   * Generate a presigned PUT URL so the client can upload directly to R2.
   * Never touches file bytes — only produces a short-lived signed URL.
   */
  async generatePresignedUrl(
    userId: string,
    listingId: string,
    filename: string,
    contentType: string
  ): Promise<{ presignedUrl: string; fileKey: string; publicUrl: string }> {
    // Verify listing exists and belongs to this user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing) {
      throw createNotFoundError('Listing');
    }

    if (listing.userId !== userId) {
      throw createForbiddenError('You do not have permission to upload photos for this listing');
    }

    // Check existing photo count
    const photoCount = await prisma.listingPhoto.count({
      where: { listingId },
    });

    if (photoCount >= MAX_PHOTOS) {
      throw new AppError(`Maximum ${MAX_PHOTOS} photos allowed per listing`, 400);
    }

    // Validate content type
    const extension = CONTENT_TYPE_EXTENSION[contentType];
    if (!extension) {
      throw new AppError('contentType must be image/jpeg, image/png, or image/webp', 400);
    }

    // Build the R2 object key
    const fileKey = `listings/${listingId}/${randomUUID()}.${extension}`;

    // Generate presigned PUT URL (5 minute expiry)
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    const publicUrl = `${env.R2_PUBLIC_URL}/${fileKey}`;

    logger.info(`Generated presigned URL for listing ${listingId} by user ${userId}`);

    return { presignedUrl, fileKey, publicUrl };
  }

  /**
   * Confirm a successful client-side upload by saving the ListingPhoto record.
   */
  async confirmUpload(userId: string, listingId: string, fileKey: string) {
    // Verify listing exists and belongs to this user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing) {
      throw createNotFoundError('Listing');
    }

    if (listing.userId !== userId) {
      throw createForbiddenError('You do not have permission to confirm uploads for this listing');
    }

    // Re-check photo count (race condition protection)
    const photoCount = await prisma.listingPhoto.count({
      where: { listingId },
    });

    if (photoCount >= MAX_PHOTOS) {
      throw new AppError(`Maximum ${MAX_PHOTOS} photos allowed per listing`, 400);
    }

    const publicUrl = `${env.R2_PUBLIC_URL}/${fileKey}`;

    const photo = await prisma.listingPhoto.create({
      data: {
        listingId,
        fileKey,
        url: publicUrl,
        order: photoCount, // append at end
      },
    });

    logger.info(`Photo confirmed for listing ${listingId}: ${photo.id}`);

    return photo;
  }

  /**
   * Delete a photo from both R2 and the database.
   */
  async deletePhoto(userId: string, photoId: string) {
    // Find photo and its parent listing
    const photo = await prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: {
        listing: {
          select: { userId: true },
        },
      },
    });

    if (!photo) {
      throw createNotFoundError('Photo');
    }

    if (photo.listing.userId !== userId) {
      throw createForbiddenError('You do not have permission to delete this photo');
    }

    // Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: photo.fileKey,
    });

    await r2Client.send(deleteCommand);

    // Delete from database
    await prisma.listingPhoto.delete({ where: { id: photoId } });

    logger.info(`Photo deleted: ${photoId} by user ${userId}`);

    return { success: true };
  }

  /**
   * Get all photos for a listing, ordered by their display order.
   */
  async getListingPhotos(listingId: string) {
    return prisma.listingPhoto.findMany({
      where: { listingId },
      orderBy: { order: 'asc' },
    });
  }
}
