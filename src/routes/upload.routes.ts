import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { presignedUrlSchema, confirmUploadSchema } from '../validators/upload.validator';

const router = Router();
const uploadController = new UploadController();

// ─── Authenticated Routes ───────────────────────────────────────

/** POST /api/v1/upload/presigned-url — Generate a presigned PUT URL for direct R2 upload */
router.post(
  '/presigned-url',
  authenticate,
  validate(presignedUrlSchema),
  uploadController.generatePresignedUrl.bind(uploadController)
);

/** POST /api/v1/upload/confirm — Confirm a completed upload by saving the DB record */
router.post(
  '/confirm',
  authenticate,
  validate(confirmUploadSchema),
  uploadController.confirmUpload.bind(uploadController)
);

/** DELETE /api/v1/upload/photo/:photoId — Delete a photo from R2 and the database */
router.delete(
  '/photo/:photoId',
  authenticate,
  uploadController.deletePhoto.bind(uploadController)
);

// ─── Public Routes ──────────────────────────────────────────────

/** GET /api/v1/upload/listing/:listingId/photos — Get all photos for a listing */
router.get(
  '/listing/:listingId/photos',
  uploadController.getListingPhotos.bind(uploadController)
);

export default router;
