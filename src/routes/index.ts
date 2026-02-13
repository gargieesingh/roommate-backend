import { Router } from 'express';
import authRoutes from './auth.routes';
import listingRoutes from './listing.routes';
import messageRoutes from './message.routes';
import safetyRoutes from './safety.routes';
import teamRoutes from './team.routes';
import userRoutes from './user.routes';
import notificationRoutes from './notification.routes';
import uploadRoutes from './upload.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/messages', messageRoutes);
router.use('/safety', safetyRoutes);
router.use('/teams', teamRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/upload', uploadRoutes);

export default router;

