import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General rate limiter for authentication endpoints.
 * 100 requests per 15 minutes per IP address.
 */
export const authRateLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for OTP endpoints.
 * 5 OTP requests per 15 minutes per IP address.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
