import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SearchUsersFilters {
  budgetMin?: number;
  budgetMax?: number;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  city?: string;
  occupation?: string;
  cleanliness?: string;
  smokingPreference?: string;
  drinkingPreference?: string;
  petsPreference?: string;
  sleepSchedule?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * Search users with filters for roommate discovery
   */
  async searchUsers(filters: SearchUsersFilters) {
    const {
      budgetMin,
      budgetMax,
      ageMin,
      ageMax,
      gender,
      city,
      occupation,
      cleanliness,
      smokingPreference,
      drinkingPreference,
      petsPreference,
      sleepSchedule,
      page = 1,
      limit = 20,
    } = filters;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const where: any = {
      isActive: true,
      isLooking: true,
      emailVerified: true, // Only show verified users
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
      where.occupation = { contains: occupation, mode: 'insensitive' };
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
