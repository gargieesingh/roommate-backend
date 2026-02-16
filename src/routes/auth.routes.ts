import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  sendPhoneOTPSchema,
  verifyPhoneOTPSchema,
  refreshTokenSchema,
  logoutSchema,
  updateProfileSchema,
  userIdParamSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// ─── Public routes ──────────────────────────────────────────────
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

router.post(
  '/logout',
  validate(logoutSchema),
  authController.logout.bind(authController)
);

// ─── Protected routes (require valid JWT) ───────────────────────
router.post(
  '/send-phone-otp',
  authenticate,
  otpRateLimiter,
  validate(sendPhoneOTPSchema),
  authController.sendPhoneOTP.bind(authController)
);

router.post(
  '/verify-phone',
  authenticate,
  validate(verifyPhoneOTPSchema),
  authController.verifyPhone.bind(authController)
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile.bind(authController)
);

// ─── Public profile view ────────────────────────────────────────
router.get(
  '/profile/:userId',
  validate(userIdParamSchema),
  authController.getPublicProfile.bind(authController)
);

// ─── Google OAuth routes ────────────────────────────────────────
import passport from 'passport';

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback.bind(authController)
);

export default router;
