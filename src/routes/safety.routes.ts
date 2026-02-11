import { Router } from 'express';
import { SafetyController } from '../controllers/safety.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  blockUserSchema,
  unblockUserParamSchema,
  createReportSchema,
  addFavoriteSchema,
  removeFavoriteParamSchema,
} from '../validators/safety.validator';

const router = Router();
const safetyController = new SafetyController();

// ─── All routes require authentication ─────────────────────────

// Block Management
/** POST /api/v1/safety/block - Block a user */
router.post('/block', authenticate, validate(blockUserSchema), safetyController.blockUser.bind(safetyController));

/** DELETE /api/v1/safety/block/:userId - Unblock a user */
router.delete(
  '/block/:userId',
  authenticate,
  validate(unblockUserParamSchema),
  safetyController.unblockUser.bind(safetyController)
);

/** GET /api/v1/safety/blocked-users - Get list of blocked users */
router.get('/blocked-users', authenticate, safetyController.getBlockedUsers.bind(safetyController));

// Report Management
/** POST /api/v1/safety/report - Submit a report */
router.post('/report', authenticate, validate(createReportSchema), safetyController.createReport.bind(safetyController));

// Favorites Management
/** POST /api/v1/favorites/add - Add listing to favorites */
router.post('/favorites/add', authenticate, validate(addFavoriteSchema), safetyController.addFavorite.bind(safetyController));

/** DELETE /api/v1/favorites/:listingId - Remove listing from favorites */
router.delete(
  '/favorites/:listingId',
  authenticate,
  validate(removeFavoriteParamSchema),
  safetyController.removeFavorite.bind(safetyController)
);

/** GET /api/v1/favorites - Get user's favorite listings */
router.get('/favorites', authenticate, safetyController.getFavorites.bind(safetyController));

export default router;
