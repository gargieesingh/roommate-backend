/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { SafetyService } from '../services/safety.service';

const safetyService = new SafetyService();

export class SafetyController {
  /** POST /api/v1/safety/block */
  async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockerId = req.user!.userId;
      const { blockedId } = req.body;

      const block = await safetyService.blockUser(blockerId, blockedId);

      res.status(201).json({
        success: true,
        message: 'User blocked successfully',
        data: { block },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/safety/block/:userId */
  async unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockerId = req.user!.userId;
      const { userId } = req.params;

      const result = await safetyService.unblockUser(blockerId, userId as string);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/safety/blocked-users */
  async getBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await safetyService.getBlockedUsers(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/safety/report */
  async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reporterId = req.user!.userId;
      const { reportedUserId, reportedListingId, reason, description } = req.body;

      const report = await safetyService.createReport(reporterId, {
        reportedUserId,
        reportedListingId,
        reason,
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/favorites/add */
  async addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { listingId } = req.body;

      const favorite = await safetyService.addFavorite(userId, listingId);

      res.status(201).json({
        success: true,
        message: 'Listing added to favorites',
        data: { favorite },
      });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/v1/favorites/:listingId */
  async removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { listingId } = req.params;

      const result = await safetyService.removeFavorite(userId, listingId as string);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/favorites */
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await safetyService.getFavorites(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
