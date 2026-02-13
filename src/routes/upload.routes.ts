import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const uploadController = new UploadController();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ─── All routes require authentication ─────────────────────

/** POST /api/v1/upload - Upload single image */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

/** POST /api/v1/upload/multiple - Upload multiple images (max 5) */
router.post(
  '/multiple',
  authenticate,
  upload.array('files', 5),
  uploadController.uploadMultiple.bind(uploadController)
);

export default router;
