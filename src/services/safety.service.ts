import prisma from '../config/database';
import { ReportReason } from '@prisma/client';
import logger from '../config/logger';

/** Fields returned for blocked users */
const BLOCKED_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  profilePhoto: true,
} as const;

/** Fields returned for favorites */
const FAVORITE_SELECT = {
  id: true,
  listingId: true,
  createdAt: true,
  listing: {
    select: {
      id: true,
      type: true,
      title: true,
      rent: true,
      city: true,
      area: true,
      photos: true,
      isActive: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
        },
      },
    },
  },
} as const;

export class SafetyService {
  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: string) {
    // Prevent self-blocking
    if (blockerId === blockedId) {
      const error = new Error('You cannot block yourself') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (existingBlock) {
      const error = new Error('User is already blocked') as Error & { statusCode: number };
      error.statusCode = 409;
      throw error;
    }

    // Create block
    const block = await prisma.block.create({
      data: {
        blockerId,
        blockedId,
      },
      include: {
        blocked: true,
      },
    });

    logger.info(`User ${blockerId} blocked user ${blockedId}`);

    return block;
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedId: string) {
    const block = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    if (!block) {
      const error = new Error('User is not blocked') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId,
        },
      },
    });

    logger.info(`User ${blockerId} unblocked user ${blockedId}`);

    return { message: 'User unblocked successfully' };
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(userId: string) {
    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { 
      blockedUsers: blocks.map((b) => ({ 
        ...b.blocked, 
        blockedAt: b.createdAt 
      })) 
    };
  }

  /**
   * Check if user is blocked
   */
  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: userId },
        ],
      },
    });

    return !!block;
  }

  /**
   * Submit a report
   */
  async createReport(
    reporterId: string,
    data: {
      reportedUserId?: string;
      reportedListingId?: string;
      reason: ReportReason;
      description?: string;
    }
  ) {
    const { reportedUserId, reportedListingId, reason, description } = data;

    // Validate that at least one target is provided
    if (!reportedUserId && !reportedListingId) {
      const error = new Error('Either reportedUserId or reportedListingId must be provided') as Error & {
        statusCode: number;
      };
      error.statusCode = 400;
      throw error;
    }

    // Prevent self-reporting
    if (reportedUserId === reporterId) {
      const error = new Error('You cannot report yourself') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedUserId,
        reportedListingId,
        reason,
        description,
      },
    });

    logger.info(`Report created: ${report.id} by user ${reporterId}`);

    return report;
  }

  /**
   * Add listing to favorites
   */
  async addFavorite(userId: string, listingId: string) {
    // Check if listing exists and is active
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      const error = new Error('Listing not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existingFavorite) {
      const error = new Error('Listing is already in favorites') as Error & { statusCode: number };
      error.statusCode = 409;
      throw error;
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        listingId,
      },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });

    logger.info(`User ${userId} favorited listing ${listingId}`);

    return favorite;
  }

  /**
   * Remove listing from favorites
   */
  async removeFavorite(userId: string, listingId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (!favorite) {
      const error = new Error('Listing is not in favorites') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    logger.info(`User ${userId} removed favorite listing ${listingId}`);

    return { message: 'Listing removed from favorites' };
  }

  /**
   * Get user's favorite listings
   */
  async getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { favorites };
  }

  /**
   * Check if listing is favorited by user
   */
  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    return !!favorite;
  }
}
