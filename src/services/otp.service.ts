import redis from '../config/redis';
import prisma from '../config/database';
import { generateOTP } from '../utils/otp.util';
import { sendSMS } from '../utils/sms.util';
import { env } from '../config/env';
import logger from '../config/logger';

/**
 * Redis key format for OTP storage: otp:{userId}:{phone}
 * This prevents the same user from having multiple active OTPs for the same phone.
 */
const getOTPKey = (userId: string, phone: string): string => `otp:${userId}:${phone}`;

export class OTPService {
  /**
   * Generate a 6-digit OTP, store it in Redis with a TTL, and send it via SMS.
   * Previous OTPs for the same user+phone are automatically overwritten.
   * @param userId - The authenticated user's ID
   * @param phone - Phone number in E.164 format
   */
  async sendPhoneOTP(userId: string, phone: string) {
    const code = generateOTP(6);
    const expirySeconds = parseInt(env.OTP_EXPIRY_MINUTES, 10) * 60;
    const redisKey = getOTPKey(userId, phone);

    // Store OTP in Redis with automatic expiry (overwrites any previous OTP)
    await redis.set(redisKey, code, 'EX', expirySeconds);

    // Update user's phone number in the database
    await prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    // Send SMS (falls back to console log if Twilio isn't configured)
    await sendSMS(phone, `Your Roommate verification code is: ${code}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`);

    logger.info(`OTP sent to ${phone} for user ${userId}`);

    return { success: true };
  }

  /**
   * Verify a phone OTP code against the value stored in Redis.
   * On success: marks the user as phone-verified in the database and deletes the OTP from Redis.
   * @param userId - The authenticated user's ID
   * @param phone - Phone number in E.164 format
   * @param code - The 6-digit OTP code the user submitted
   */
  async verifyPhoneOTP(userId: string, phone: string, code: string) {
    const redisKey = getOTPKey(userId, phone);
    const storedCode = await redis.get(redisKey);

    if (!storedCode) {
      const error = new Error('OTP expired or not found. Please request a new one.') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    if (storedCode !== code) {
      const error = new Error('Invalid OTP code') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }

    // Mark user as phone-verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        phoneVerified: true,
      },
    });

    // Delete OTP from Redis (one-time use)
    await redis.del(redisKey);

    logger.info(`Phone verified for user ${userId}: ${phone}`);

    return { success: true };
  }
}
