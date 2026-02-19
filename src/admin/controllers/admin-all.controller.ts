/// <reference path="../../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { AdminTeamsService } from '../services/admin-teams.service';
import { AdminConversationsService } from '../services/admin-conversations.service';
import { AdminReportsService } from '../services/admin-reports.service';
import { AdminReviewsService } from '../services/admin-reviews.service';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import { AdminNotificationsService } from '../services/admin-notifications.service';
import { AdminSettingsService } from '../services/admin-settings.service';
import { AdminExportService } from '../services/admin-export.service';
import { AuditLogService } from '../services/audit-log.service';

const adminTeamsService = new AdminTeamsService();
const adminConversationsService = new AdminConversationsService();
const adminReportsService = new AdminReportsService();
const adminReviewsService = new AdminReviewsService();
const adminAnalyticsService = new AdminAnalyticsService();
const adminNotificationsService = new AdminNotificationsService();
const adminSettingsService = new AdminSettingsService();
const adminExportService = new AdminExportService();
const auditLogService = new AuditLogService();

// ============ TEAMS ============
export class AdminTeamsController {
    async getTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminTeamsService.getTeams({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
                city: req.query.city as string,
                status: req.query.status as string,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getTeamById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const team = await adminTeamsService.getTeamById(req.params.id as string);
            res.json({ success: true, data: { team } });
        } catch (error) {
            next(error);
        }
    }

    async removeTeamMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminTeamsService.removeTeamMember(req.params.teamId as string, req.params.userId as string, adminId, ipAddress);
            res.json({ success: true, message: 'Team member removed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async deleteTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminTeamsService.deleteTeam(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Team deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

// ============ CONVERSATIONS ============
export class AdminConversationsController {
    async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminConversationsService.getConversations({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getConversationById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversation = await adminConversationsService.getConversationById(req.params.id as string);
            res.json({ success: true, data: { conversation } });
        } catch (error) {
            next(error);
        }
    }

    async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminConversationsService.deleteConversation(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Conversation deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

// ============ REPORTS ============
export class AdminReportsController {
    async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminReportsService.getReports({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                type: req.query.type as string,
                status: req.query.status as string,
                search: req.query.search as string,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const report = await adminReportsService.getReportById(req.params.id as string);
            res.json({ success: true, data: { report } });
        } catch (error) {
            next(error);
        }
    }

    async updateReportStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { status, notes } = req.body;
            const report = await adminReportsService.updateReportStatus(req.params.id as string, status, notes, adminId, ipAddress);
            res.json({ success: true, message: 'Report status updated successfully', data: { report } });
        } catch (error) {
            next(error);
        }
    }
}

// ============ REVIEWS ============
export class AdminReviewsController {
    async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminReviewsService.getReviews({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
                maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
                isHidden: req.query.isHidden === 'true' ? true : req.query.isHidden === 'false' ? false : undefined,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async hideReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const review = await adminReviewsService.hideReview(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Review hidden successfully', data: { review } });
        } catch (error) {
            next(error);
        }
    }

    async showReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const review = await adminReviewsService.showReview(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Review shown successfully', data: { review } });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminReviewsService.deleteReview(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Review deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

// ============ ANALYTICS ============
export class AdminAnalyticsController {
    async getOverviewStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await adminAnalyticsService.getOverviewStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    async getUserAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dateRange = req.query.dateRange as string || '30days';
            const analytics = await adminAnalyticsService.getUserAnalytics(dateRange);
            res.json({ success: true, data: analytics });
        } catch (error) {
            next(error);
        }
    }

    async getListingAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dateRange = req.query.dateRange as string || '30days';
            const analytics = await adminAnalyticsService.getListingAnalytics(dateRange);
            res.json({ success: true, data: analytics });
        } catch (error) {
            next(error);
        }
    }

    async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const activity = await adminAnalyticsService.getRecentActivity();
            res.json({ success: true, data: { activity } });
        } catch (error) {
            next(error);
        }
    }
}

// ============ NOTIFICATIONS ============
export class AdminNotificationsController {
    async sendNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const result = await adminNotificationsService.sendNotification(req.body, adminId, ipAddress);
            res.json({ success: true, message: 'Notification sent successfully', data: result });
        } catch (error) {
            next(error);
        }
    }

    async getNotificationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminNotificationsService.getNotificationHistory({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

// ============ SETTINGS ============
export class AdminSettingsController {
    async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const settings = await adminSettingsService.getSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const settings = await adminSettingsService.updateSettings(req.body, adminId, ipAddress);
            res.json({ success: true, message: 'Settings updated successfully', data: settings });
        } catch (error) {
            next(error);
        }
    }

    async getAdminTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const admins = await adminSettingsService.getAdminTeam();
            res.json({ success: true, data: { admins } });
        } catch (error) {
            next(error);
        }
    }

    async inviteAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            const { email } = req.body;
            const user = await adminSettingsService.inviteAdmin(email, adminId, ipAddress);
            res.json({ success: true, message: 'Admin invited successfully', data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async removeAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user!.userId;
            const ipAddress = req.ip;
            await adminSettingsService.removeAdmin(req.params.id as string, adminId, ipAddress);
            res.json({ success: true, message: 'Admin removed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getAuditLog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await auditLogService.getAuditLogs({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                adminId: req.query.adminId as string,
                actionType: req.query.actionType as string,
                entityType: req.query.entityType as string,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

// ============ EXPORT ============
export class AdminExportController {
    async exportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const csv = await adminExportService.exportUsers(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    async exportListings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const csv = await adminExportService.exportListings(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=listings.csv');
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }
}
