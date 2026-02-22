import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchUsersFilters {
  // Support both naming conventions from the frontend
  budgetMin?: number | string;
  budgetMax?: number | string;
  minBudget?: number | string;
  maxBudget?: number | string;
  ageMin?: number | string;
  ageMax?: number | string;
  minAge?: number | string;
  maxAge?: number | string;
  gender?: string;
  city?: string;
  location?: string;
  occupation?: string | string[];
  cleanliness?: string;
  smokingPreference?: string;
  smoking?: string;
  drinkingPreference?: string;
  petsPreference?: string;
  pets?: string;
  sleepSchedule?: string;
  verifiedOnly?: boolean | string;
  page?: number | string;
  limit?: number | string;
  [key: string]: any;
}

export class UserService {
  /**
   * Search users with filters for roommate discovery
   */
  async searchUsers(filters: SearchUsersFilters) {
    // Support both naming conventions (minBudget / budgetMin, etc.)
    const budgetMin = filters.budgetMin ?? filters.minBudget;
    const budgetMax = filters.budgetMax ?? filters.maxBudget;
    const ageMin = filters.ageMin ?? filters.minAge;
    const ageMax = filters.ageMax ?? filters.maxAge;
    const gender = filters.gender;
    const city = filters.city ?? filters.location;
    const occupation = filters.occupation;
    const cleanliness = filters.cleanliness;
    const smokingPreference = filters.smokingPreference ?? filters.smoking;
    const drinkingPreference = filters.drinkingPreference;
    const petsPreference = filters.petsPreference ?? filters.pets;
    const sleepSchedule = filters.sleepSchedule;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : (page as number);
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : (limit as number);
    const skip = (pageNum - 1) * limitNum;
    const where: any = {
      isActive: true,
    };

    // Budget filters
    if (budgetMin !== undefined || budgetMax !== undefined) {
      where.AND = where.AND || [];
      if (budgetMin !== undefined) {
        where.AND.push({ budgetMax: { gte: budgetMin } });
      }
      if (budgetMax !== undefined) {
        where.AND.push({ budgetMin: { lte: budgetMax } });
      }
    }

    // Age filters
    if (ageMin !== undefined) {
      where.age = { ...where.age, gte: ageMin };
    }
    if (ageMax !== undefined) {
      where.age = { ...where.age, lte: ageMax };
    }

    // Exact match filters
    if (gender) {
      where.gender = gender;
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (occupation) {
      if (Array.isArray(occupation)) {
        where.OR = (where.OR || []).concat(
          occupation.map((occ: string) => ({ occupation: { contains: occ, mode: 'insensitive' } }))
        );
      } else {
        where.occupation = { contains: occupation as string, mode: 'insensitive' };
      }
    }
    if (cleanliness) {
      where.cleanliness = cleanliness;
    }
    if (smokingPreference) {
      where.smokingPreference = smokingPreference;
    }
    if (drinkingPreference) {
      where.drinkingPreference = drinkingPreference;
    }
    if (petsPreference) {
      where.petsPreference = petsPreference;
    }
    if (sleepSchedule) {
      where.sleepSchedule = sleepSchedule;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
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
          cleanliness: true,
          smokingPreference: true,
          drinkingPreference: true,
          petsPreference: true,
          sleepSchedule: true,
          interests: true,
          languages: true,
          profilePhoto: true,
          createdAt: true,
          // Include average rating
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate average rating for each user
    const usersWithRating = users.map((user) => {
      const ratings = user.reviewsReceived.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const { reviewsReceived, ...userData } = user;
      return {
        ...userData,
        averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        reviewCount: ratings.length,
      };
    });

    return {
      users: usersWithRating,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get public user profile with reviews
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        cleanliness: true,
        smokingPreference: true,
        drinkingPreference: true,
        petsPreference: true,
        sleepSchedule: true,
        interests: true,
        languages: true,
        profilePhoto: true,
        additionalPhotos: true,
        createdAt: true,
        reviewsReceived: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
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
          take: 10, // Latest 10 reviews
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate average rating
    const ratings = user.reviewsReceived.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      ...user,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
    };
  }
}
