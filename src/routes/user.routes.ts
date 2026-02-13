import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  searchUsersSchema,
  userIdParamSchema,
  createReviewSchema,
  getUserReviewsSchema,
} from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// ─── Public routes ──────────────────────────────────────────

/** GET /api/v1/users - Search users for roommate discovery */
router.get(
  '/',
  validate(searchUsersSchema),
  userController.search.bind(userController)
);

/** GET /api/v1/users/:id - Get public user profile */
router.get(
  '/:id',
  validate(userIdParamSchema),
  userController.getById.bind(userController)
);

/** GET /api/v1/users/:id/reviews - Get user reviews */
router.get(
  '/:id/reviews',
  validate(getUserReviewsSchema),
  userController.getReviews.bind(userController)
);

// ─── Protected routes (require valid JWT) ───────────────────

/** POST /api/v1/users/:id/reviews - Create review for a user */
router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  userController.createReview.bind(userController)
);

export default router;
