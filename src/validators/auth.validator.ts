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
  body: z
    .object({
      // Basic Profile
      firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
      lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
      age: z.number().int().min(18, 'Must be at least 18').max(100, 'Must be 100 or younger').optional(),
      gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']).optional(),
      city: z.string().min(2, 'City must be at least 2 characters').optional(),
      bio: z.string().max(500, 'Bio must be 500 characters or fewer').optional(),

      // Lifestyle & Preferences
      occupation: z.string().min(2, 'Occupation must be at least 2 characters').optional(),
      smokingPreference: z.enum(['YES', 'NO', 'OCCASIONALLY']).optional(),
      drinkingPreference: z.enum(['YES', 'NO', 'OCCASIONALLY', 'SOCIALLY']).optional(),
      petsPreference: z.enum(['HAS_PETS', 'NO_PETS', 'OPEN_TO_PETS']).optional(),
      sleepSchedule: z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE']).optional(),
      cleanliness: z.enum(['VERY_CLEAN', 'MODERATELY_CLEAN', 'RELAXED']).optional(),

      // Budget & Location
      budgetMin: z.number().int().positive('Budget minimum must be positive').optional(),
      budgetMax: z.number().int().positive('Budget maximum must be positive').optional(),
      preferredRadius: z.number().int().positive('Preferred radius must be positive').optional(),

      // Interests & Languages
      interests: z.array(z.string().min(1)).max(20, 'Maximum 20 interests allowed').optional(),
      languages: z.array(z.string().min(1)).max(10, 'Maximum 10 languages allowed').optional(),

      // Photos
      profilePhoto: z.string().min(1, 'Profile photo cannot be empty').optional(),
      additionalPhotos: z.array(z.string().url('Each photo must be a valid URL')).max(5, 'Maximum 5 additional photos allowed').optional(),
    })
    .refine(
      (data) => {
        // Validate budget range if both are provided
        if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
          return data.budgetMin <= data.budgetMax;
        }
        return true;
      },
      {
        message: 'Budget minimum must be less than or equal to budget maximum',
        path: ['budgetMin'],
      }
    ),
});

/** GET /api/v1/auth/profile/:userId */
export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID format'),
  }),
});

