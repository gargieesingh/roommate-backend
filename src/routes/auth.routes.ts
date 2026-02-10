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

export default router;
