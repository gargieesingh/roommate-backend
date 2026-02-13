import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { AppError } from '../utils/errors';

const uploadService = new UploadService();

export class UploadController {
  /** POST /api/v1/upload - Upload single image */
  async uploadSingle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const folder = req.body.folder || 'general';
      const result = await uploadService.uploadImage(req.file, folder);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/upload/multiple - Upload multiple images */
  async uploadMultiple(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const folder = req.body.folder || 'general';
      const results = await uploadService.uploadMultipleImages(req.files, folder);

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: { urls: results.map((r) => r.url) },
      });
    } catch (error) {
      next(error);
    }
  }
}
