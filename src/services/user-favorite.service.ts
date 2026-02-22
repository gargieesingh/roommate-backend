import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserFavoriteService {
  /**
   * Toggle favorite: add if not exists, remove if exists.
   * Returns { favorited: true } or { favorited: false }
   */
  async toggleFavorite(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new Error('Cannot favorite yourself');
    }

    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_favoriteUserId: { userId, favoriteUserId: targetUserId },
      },
    });

    if (existing) {
      await prisma.userFavorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    } else {
      await prisma.userFavorite.create({
        data: { userId, favoriteUserId: targetUserId },
      });
      return { favorited: true };
    }
  }

  /**
   * Check if userId has favorited targetUserId
   */
  async isFavorited(userId: string, targetUserId: string): Promise<boolean> {
    const record = await prisma.userFavorite.findUnique({
      where: {
        userId_favoriteUserId: { userId, favoriteUserId: targetUserId },
      },
    });
    return !!record;
  }

  /**
   * Get all users favorited by userId (with basic profile info)
   */
  async getFavorites(userId: string) {
    const rows = await prisma.userFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        favoriteUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
            city: true,
            bio: true,
            occupation: true,
            budgetMin: true,
            budgetMax: true,
            profilePhoto: true,
            sleepSchedule: true,
            createdAt: true,
            reviewsReceived: {
              select: { rating: true },
            },
          },
        },
      },
    });

    return rows.map((row) => {
      const u = row.favoriteUser;
      const ratings = u.reviewsReceived.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const { reviewsReceived, ...userData } = u;
      return {
        ...userData,
        favoritedAt: row.createdAt,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });
  }
}
