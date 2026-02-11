import { Router } from 'express';
import authRoutes from './auth.routes';
import listingRoutes from './listing.routes';
import messageRoutes from './message.routes';
import safetyRoutes from './safety.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/messages', messageRoutes);
router.use('/safety', safetyRoutes);

export default router;

