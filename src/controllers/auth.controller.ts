/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { OTPService } from '../services/otp.service';

const authService = new AuthService();
const otpService = new OTPService();

export class AuthController {
  /** POST /api/v1/auth/register */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.register({ email, password, firstName, lastName });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/auth/login */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/auth/send-phone-otp */
  async sendPhoneOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;
      const userId = req.user!.userId;

      await otpService.sendPhoneOTP(userId, phone);

      res.json({
        success: true,
        message: 'OTP sent to your phone',
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/auth/verify-phone */
  async verifyPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, code } = req.body;
      const userId = req.user!.userId;

      await otpService.verifyPhoneOTP(userId, phone, code);

      res.json({
        success: true,
        message: 'Phone verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/auth/refresh-token */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/auth/logout */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/auth/profile */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/v1/auth/profile */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await authService.updateProfile(userId, req.body);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/auth/profile/:userId */
  async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const user = await authService.getPublicProfile(userId);

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/auth/google - Initiate Google OAuth flow */
  googleAuth(req: Request, res: Response, next: NextFunction): void {
    // Passport will redirect to Google OAuth consent screen
    // This is handled by passport middleware in routes
  }

  /** GET /api/v1/auth/google/callback - Handle Google OAuth callback */
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as any;

      if (!user) {
        const error = new Error('Authentication failed') as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
      }

      // Generate JWT tokens
      const { generateAccessToken, generateRefreshToken } = await import('../utils/jwt.util');
      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // Persist refresh token
      const prisma = (await import('../config/database')).default;
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Redirect to frontend with tokens in URL
      const { env } = await import('../config/env');
      const frontendUrl = env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } catch (error) {
      next(error);
    }
  }
}
