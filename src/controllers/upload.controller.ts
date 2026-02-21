import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';

const uploadService = new UploadService();

export class UploadController {
  /** POST /api/v1/upload/presigned-url */
  async generatePresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { listingId, filename, contentType } = req.body;

      const result = await uploadService.generatePresignedUrl(userId, listingId, filename, contentType);

      res.status(200).json({
        success: true,
        message: 'Presigned URL generated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/upload/confirm */
  async confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { listingId, fileKey } = req.body;

      const photo = await uploadService.confirmUpload(userId, listingId, fileKey);

      res.status(201).json({
        success: true,
        message: 'Photo upload confirmed',
        data: { photo },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/upload/photo/:photoId */
  async deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const photoId = req.params['photoId'] as string;

      await uploadService.deletePhoto(userId, photoId);

      res.status(200).json({
        success: true,
        message: 'Photo deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/upload/listing/:listingId/photos */
  async getListingPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const listingId = req.params['listingId'] as string;

      const photos = await uploadService.getListingPhotos(listingId);

      res.status(200).json({
        success: true,
        message: 'Photos retrieved successfully',
        data: { photos },
      });
    } catch (error) {
      next(error);
    }
  }
}
