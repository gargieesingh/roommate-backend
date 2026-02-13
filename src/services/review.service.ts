import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

interface CreateReviewData {
  rating: number;
  comment?: string;
}

export class ReviewService {
  /**
   * Create a review for a user
   */
  async createReview(reviewerId: string, reviewedId: string, data: CreateReviewData) {
    // Prevent self-reviews
    if (reviewerId === reviewedId) {
      throw new AppError('You cannot review yourself', 400);
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Check if reviewed user exists
    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedId },
    });

    if (!reviewedUser) {
      throw new AppError('User not found', 404);
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_reviewedId: { reviewerId, reviewedId },
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this user', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId,
        reviewedId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Get all reviews for a user
   */
  async getUserReviews(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewedId: userId },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { reviewedId: userId } }),
    ]);

    // Calculate average rating
    const avgRating = await this.getAverageRating(userId);

    return {
      reviews,
      averageRating: avgRating,
      totalReviews: total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get average rating for a user
   */
  async getAverageRating(userId: string): Promise<number> {
    const result = await prisma.review.aggregate({
      where: { reviewedId: userId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0;
  }

  /**
   * Check if a user has already reviewed another user
   */
  async hasReviewed(reviewerId: string, reviewedId: string): Promise<boolean> {
    const review = await prisma.review.findUnique({
      where: {
        reviewerId_reviewedId: { reviewerId, reviewedId },
      },
    });

    return !!review;
  }
}
