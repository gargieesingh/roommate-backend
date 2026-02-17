import { Router } from 'express';
import { authenticateAdmin } from '../middleware/admin-auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimit.middleware';

// Controllers
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { AdminUsersController } from '../controllers/admin-users.controller';
import { AdminListingsController } from '../controllers/admin-listings.controller';
import {
    AdminTeamsController,
    AdminConversationsController,
    AdminReportsController,
    AdminReviewsController,
    AdminAnalyticsController,
    AdminNotificationsController,
    AdminSettingsController,
    AdminExportController,
} from '../controllers/admin-all.controller';

const router = Router();

// Initialize controllers
const adminAuthController = new AdminAuthController();
const adminUsersController = new AdminUsersController();
const adminListingsController = new AdminListingsController();
const adminTeamsController = new AdminTeamsController();
const adminConversationsController = new AdminConversationsController();
const adminReportsController = new AdminReportsController();
const adminReviewsController = new AdminReviewsController();
const adminAnalyticsController = new AdminAnalyticsController();
const adminNotificationsController = new AdminNotificationsController();
const adminSettingsController = new AdminSettingsController();
const adminExportController = new AdminExportController();

// ============ AUTH ROUTES (Public) ============
router.post('/auth/login', authRateLimiter, adminAuthController.login.bind(adminAuthController));
router.post('/auth/logout', adminAuthController.logout.bind(adminAuthController));

// ============ PROTECTED ROUTES ============
// Apply admin authentication middleware to all routes below
router.use(authenticateAdmin);

// Auth
router.get('/auth/me', adminAuthController.getProfile.bind(adminAuthController));

// Users
router.get('/users', adminUsersController.getUsers.bind(adminUsersController));
router.get('/users/:id', adminUsersController.getUserById.bind(adminUsersController));
router.put('/users/:id', adminUsersController.updateUser.bind(adminUsersController));
router.post('/users/:id/suspend', adminUsersController.suspendUser.bind(adminUsersController));
router.post('/users/:id/ban', adminUsersController.banUser.bind(adminUsersController));
router.post('/users/:id/unban', adminUsersController.unbanUser.bind(adminUsersController));
router.post('/users/:id/unsuspend', adminUsersController.unsuspendUser.bind(adminUsersController));
router.post('/users/:id/verify-email', adminUsersController.verifyEmail.bind(adminUsersController));
router.post('/users/:id/verify-phone', adminUsersController.verifyPhone.bind(adminUsersController));
router.delete('/users/:id', adminUsersController.deleteUser.bind(adminUsersController));

// Listings
router.get('/listings', adminListingsController.getListings.bind(adminListingsController));
router.get('/listings/:id', adminListingsController.getListingById.bind(adminListingsController));
router.put('/listings/:id', adminListingsController.updateListing.bind(adminListingsController));
router.patch('/listings/:id/toggle-status', adminListingsController.toggleListingStatus.bind(adminListingsController));
router.post('/listings/:id/flag', adminListingsController.flagListing.bind(adminListingsController));
router.post('/listings/:id/unflag', adminListingsController.unflagListing.bind(adminListingsController));
router.delete('/listings/:id', adminListingsController.deleteListing.bind(adminListingsController));

// Teams
router.get('/teams', adminTeamsController.getTeams.bind(adminTeamsController));
router.get('/teams/:id', adminTeamsController.getTeamById.bind(adminTeamsController));
router.delete('/teams/:teamId/members/:userId', adminTeamsController.removeTeamMember.bind(adminTeamsController));
router.delete('/teams/:id', adminTeamsController.deleteTeam.bind(adminTeamsController));

// Conversations
router.get('/conversations', adminConversationsController.getConversations.bind(adminConversationsController));
router.get('/conversations/:id', adminConversationsController.getConversationById.bind(adminConversationsController));
router.delete('/conversations/:id', adminConversationsController.deleteConversation.bind(adminConversationsController));

// Reports
router.get('/reports', adminReportsController.getReports.bind(adminReportsController));
router.get('/reports/:id', adminReportsController.getReportById.bind(adminReportsController));
router.patch('/reports/:id/status', adminReportsController.updateReportStatus.bind(adminReportsController));

// Reviews
router.get('/reviews', adminReviewsController.getReviews.bind(adminReviewsController));
router.patch('/reviews/:id/hide', adminReviewsController.hideReview.bind(adminReviewsController));
router.patch('/reviews/:id/show', adminReviewsController.showReview.bind(adminReviewsController));
router.delete('/reviews/:id', adminReviewsController.deleteReview.bind(adminReviewsController));

// Notifications
router.post('/notifications/send', adminNotificationsController.sendNotification.bind(adminNotificationsController));
router.get('/notifications/history', adminNotificationsController.getNotificationHistory.bind(adminNotificationsController));

// Analytics
router.get('/analytics/overview', adminAnalyticsController.getOverviewStats.bind(adminAnalyticsController));
router.get('/analytics/users', adminAnalyticsController.getUserAnalytics.bind(adminAnalyticsController));
router.get('/analytics/listings', adminAnalyticsController.getListingAnalytics.bind(adminAnalyticsController));
router.get('/analytics/activity', adminAnalyticsController.getRecentActivity.bind(adminAnalyticsController));

// Settings
router.get('/settings', adminSettingsController.getSettings.bind(adminSettingsController));
router.put('/settings', adminSettingsController.updateSettings.bind(adminSettingsController));
router.get('/team', adminSettingsController.getAdminTeam.bind(adminSettingsController));
router.post('/team/invite', adminSettingsController.inviteAdmin.bind(adminSettingsController));
router.delete('/team/:id', adminSettingsController.removeAdmin.bind(adminSettingsController));
router.get('/audit-log', adminSettingsController.getAuditLog.bind(adminSettingsController));

// Bulk Actions
router.post('/users/bulk-action', adminUsersController.bulkAction.bind(adminUsersController));
router.post('/listings/bulk-action', adminListingsController.bulkAction.bind(adminListingsController));

// Export
router.get('/export/users', adminExportController.exportUsers.bind(adminExportController));
router.get('/export/listings', adminExportController.exportListings.bind(adminExportController));

export default router;
