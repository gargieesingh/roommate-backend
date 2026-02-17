import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import listingRoutes from './listing.routes';
import messageRoutes from './message.routes';
import safetyRoutes from './safety.routes';
import teamRoutes from './team.routes';
import uploadRoutes from './upload.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from '../admin/routes/admin.routes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/messages', messageRoutes);
router.use('/safety', safetyRoutes);
router.use('/teams', teamRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);

// Admin Routes
router.use('/admin', adminRoutes);

export default router;
