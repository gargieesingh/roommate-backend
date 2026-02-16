import prisma from '../config/database';
// import { Gender } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/hash.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import logger from '../config/logger';

import { Gender, SmokingPreference, DrinkingPreference, PetsPreference, SleepSchedule, Cleanliness } from '@prisma/client';

/** Fields returned in API responses (never includes passwordHash) */
const USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  age: true,
  gender: true,
  city: true,
  bio: true,
  occupation: true,
  smokingPreference: true,
  drinkingPreference: true,
  petsPreference: true,
  sleepSchedule: true,
  cleanliness: true,
  budgetMin: true,
  budgetMax: true,
  preferredRadius: true,
  interests: true,
  languages: true,
  profilePhoto: true,
  additionalPhotos: true,
  emailVerified: true,
  phoneVerified: true,
  isActive: true,
  isLooking: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const;

/** Public profile fields (excludes email, phone, and verification status) */
const PUBLIC_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  age: true,
  gender: true,
  city: true,
  bio: true,
  occupation: true,
  smokingPreference: true,
  drinkingPreference: true,
  petsPreference: true,
  sleepSchedule: true,
  cleanliness: true,
  budgetMin: true,
  budgetMax: true,
  preferredRadius: true,
  interests: true,
  languages: true,
  profilePhoto: true,
  additionalPhotos: true,
  createdAt: true,
} as const;

export class AuthService {
  /**
   * Register a new user with email and password.
   * Hashes the password, creates the user, generates JWT tokens,
   * and persists the refresh token in the database.
   */
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const error = new Error('A user with this email already exists') as Error & { statusCode: number };
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: USER_SELECT,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Persist refresh token (30-day expiry)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`User registered: ${user.email}`);

    return {
      user,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Authenticate a user with email and password.
   * Verifies credentials, updates last login, and issues new tokens.
   */
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    // Check if account is active
    if (!user.isActive) {
      const error = new Error('Account is disabled. Please contact support.') as Error & { statusCode: number };
      error.statusCode = 403;
      throw error;
    }

    // Update last login timestamp
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: USER_SELECT,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Persist refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: updatedUser,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Exchange a valid refresh token for a new access token.
   * Validates the refresh token exists in the DB and hasn't expired.
   */
  async refreshToken(refreshToken: string) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      const error = new Error('Invalid refresh token') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    // Check if the token has expired
    if (tokenRecord.expiresAt < new Date()) {
      // Clean up the expired token
      await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      const error = new Error('Refresh token has expired. Please login again.') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
    });

    return { accessToken };
  }

  /**
   * Invalidate a refresh token by deleting it from the database.
   */
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    logger.info('User logged out (refresh token invalidated)');
  }

  /**
   * Fetch a user's profile by ID. Never returns the password hash.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });

    if (!user) {
      const error = new Error('User not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update a user's profile fields.
   * Only updates the fields that are provided.
   */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      age?: number;
      gender?: Gender;
      city?: string;
      bio?: string;
      occupation?: string;
      smokingPreference?: SmokingPreference;
      drinkingPreference?: DrinkingPreference;
      petsPreference?: PetsPreference;
      sleepSchedule?: SleepSchedule;
      cleanliness?: Cleanliness;
      budgetMin?: number;
      budgetMax?: number;
      preferredRadius?: number;
      interests?: string[];
      languages?: string[];
      profilePhoto?: string;
      additionalPhotos?: string[];
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });

    logger.info(`Profile updated for user: ${userId}`);

    return user;
  }

  /**
   * Get public profile by user ID.
   * Excludes sensitive information like email, phone, and verification status.
   */
  async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });

    if (!user) {
      const error = new Error('User not found') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    if (!user) {
      const error = new Error('User profile is not available') as Error & { statusCode: number };
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}
