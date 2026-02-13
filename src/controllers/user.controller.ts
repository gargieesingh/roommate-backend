import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ReviewService } from '../services/review.service';
import { AppError } from '../utils/errors';

const userService = new UserService();
const reviewService = new ReviewService();

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
      const user = await userService.getUserById(id);

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
      const review = await reviewService.createReview(reviewerId, reviewedId, req.body);

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
        id,
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
}
