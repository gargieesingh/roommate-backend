import { z } from 'zod';

/** POST /api/v1/auth/register */
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  }),
});

/** POST /api/v1/auth/login */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/** POST /api/v1/auth/send-phone-otp */
export const sendPhoneOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g. +1234567890)'),
  }),
});

/** POST /api/v1/auth/verify-phone */
export const verifyPhoneOTPSchema = z.object({
  body: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    code: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

/** POST /api/v1/auth/refresh-token */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/** POST /api/v1/auth/logout */
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/** PUT /api/v1/auth/profile */
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    age: z.number().int().min(18, 'Must be at least 18').max(100, 'Must be 100 or younger').optional(),
    gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
    city: z.string().min(2, 'City must be at least 2 characters').optional(),
    bio: z.string().max(150, 'Bio must be 150 characters or fewer').optional(),
    photoUrl: z.string().url('Photo URL must be a valid URL').optional(),
  }),
});
