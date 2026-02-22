import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ReviewService } from '../services/review.service';
import { UserFavoriteService } from '../services/user-favorite.service';
import { AppError } from '../utils/errors';

const userService = new UserService();
const reviewService = new ReviewService();
const userFavoriteService = new UserFavoriteService();

export class UserController {
  /** GET /api/v1/users - Search users */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query;
      const result = await userService.searchUsers(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/users/:id - Get user profile */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id as string);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/users/:id/reviews - Create review */
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: reviewedId } = req.params;
      const reviewerId = req.user!.userId;
      const review = await reviewService.createReview(reviewerId, reviewedId as string, req.body);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/users/:id/reviews - Get user reviews */
  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const result = await reviewService.getUserReviews(
        id as string,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/users/:id/favorite - Toggle favorite a user */
  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { id: targetUserId } = req.params;
      const result = await userFavoriteService.toggleFavorite(currentUserId, targetUserId as string);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/users/favorites - Get current user's favorited users */
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const favorites = await userFavoriteService.getFavorites(currentUserId);
      res.json({ success: true, data: { favorites } });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/users/:id/favorite - Check if current user has favorited a user */
  async checkFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { id: targetUserId } = req.params;
      const favorited = await userFavoriteService.isFavorited(currentUserId, targetUserId as string);
      res.json({ success: true, data: { favorited } });
    } catch (error) {
      next(error);
    }
  }
}
