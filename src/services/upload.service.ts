import { AppError } from '../utils/errors';
import { env } from '../config/env';

// This service provides a flexible upload implementation
// By default, it returns mock URLs for development
// In production, integrate with Cloudinary or AWS S3

interface UploadResult {
  url: string;
  publicId?: string;
}

export class UploadService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new AppError('File size must be less than 5MB', 400);
    }

    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Only JPEG, PNG, and WebP images are allowed', 400);
    }
  }

  /**
   * Upload single image
   * TODO: Integrate with Cloudinary or AWS S3 in production
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    this.validateFile(file);

    // For development: return a mock URL
    // In production, replace this with actual Cloudinary/S3 upload
    const mockUrl = `https://storage.example.com/${folder}/${Date.now()}-${file.originalname}`;

    // Example Cloudinary integration (commented out):
    /*
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `roommates/${folder}`,
          resource_type: 'image',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      uploadStream.end(file.buffer);
    });

    return result;
    */

    return { url: mockUrl };
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    if (files.length > 5) {
      throw new AppError('Maximum 5 images allowed', 400);
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    return results;
  }

  /**
   * Delete image
   * TODO: Implement deletion for Cloudinary/S3
   */
  async deleteImage(url: string): Promise<void> {
    // For development: no-op
    // In production, implement actual deletion

    // Example Cloudinary deletion (commented out):
    /*
    const cloudinary = require('cloudinary').v2;
    const publicId = this.extractPublicIdFromUrl(url);
    await cloudinary.uploader.destroy(publicId);
    */
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  private extractPublicIdFromUrl(url: string): string {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}
