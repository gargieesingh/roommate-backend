import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  createListingSchema,
  updateListingSchema,
  listingIdParamSchema,
  userIdListingsParamSchema,
  searchListingsSchema,
} from '../validators/listing.validator';

const router = Router();
const listingController = new ListingController();

// ─── Public routes ──────────────────────────────────────────────

/** GET /api/v1/listings/search - Search listings with filters */
router.get(
  '/search',
  validate(searchListingsSchema),
  listingController.search.bind(listingController)
);

/** GET /api/v1/listings/user/:userId - Get all listings by a user */
router.get(
  '/user/:userId',
  validate(userIdListingsParamSchema),
  listingController.getUserListings.bind(listingController)
);

// ─── Protected routes (require valid JWT) ───────────────────────

/** GET /api/v1/listings/my-listings - Get current user's listings */
router.get(
  '/my-listings',
  authenticate,
  listingController.getMyListings.bind(listingController)
);

/** GET /api/v1/listings/:id - Get listing by ID */
router.get(
  '/:id',
  validate(listingIdParamSchema),
  listingController.getById.bind(listingController)
);

// ─── Protected routes (require valid JWT) ───────────────────────

import { upload } from '../middleware/multer.middleware';

/** POST /api/v1/listings - Create new listing */
router.post(
  '/',
  authenticate,
  upload.array('photos', 8),
  validate(createListingSchema),
  listingController.create.bind(listingController)
);

/** PUT /api/v1/listings/:id - Update listing */
router.put(
  '/:id',
  authenticate,
  // Combine param + body validation in ONE schema so the validate middleware
  // doesn't overwrite req.body with undefined between two separate calls.
  validate(
    listingIdParamSchema.merge(updateListingSchema)
  ),
  listingController.update.bind(listingController)
);

/** DELETE /api/v1/listings/:id - Delete listing (soft delete) */
router.delete(
  '/:id',
  authenticate,
  validate(listingIdParamSchema),
  listingController.delete.bind(listingController)
);

export default router;
