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

// ─── Protected routes (require valid JWT) ───────────────────

/** GET /api/v1/users/favorites - Get current user's favorited users */
// NOTE: must be registered BEFORE /:id to avoid "favorites" being treated as an ID
router.get(
  '/favorites',
  authenticate,
  userController.getFavorites.bind(userController)
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

/** GET /api/v1/users/:id/favorite - Check if current user has favorited this user */
router.get(
  '/:id/favorite',
  authenticate,
  userController.checkFavorite.bind(userController)
);

/** POST /api/v1/users/:id/reviews - Create review for a user */
router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewSchema),
  userController.createReview.bind(userController)
);

/** POST /api/v1/users/:id/favorite - Toggle favorite a user */
router.post(
  '/:id/favorite',
  authenticate,
  userController.toggleFavorite.bind(userController)
);

export default router;
