import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, changePassword, forgotPassword, resetPassword, googleSignIn, updateProfile, requestVerificationCode, verifyAndRegister } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/auth/request-verification
 * Step 1: Request email verification code for signup
 */
router.post(
  '/request-verification',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    validateRequest
  ],
  requestVerificationCode
);

/**
 * POST /api/auth/verify-and-register
 * Step 2: Verify code and complete registration
 */
router.post(
  '/verify-and-register',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('code')
      .notEmpty()
      .withMessage('Verification code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be 6 digits'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Name must not exceed 100 characters'),
    validateRequest
  ],
  verifyAndRegister
);

/**
 * POST /api/auth/register
 * Register a new user (OLD METHOD - for backward compatibility)
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Name must not exceed 100 characters'),
    validateRequest
  ],
  registerUser
);

/**
 * POST /api/auth/login
 * Login an existing user
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validateRequest
  ],
  loginUser
);

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
    validateRequest
  ],
  changePassword
);

/**
 * POST /api/auth/forgot-password
 * Request password reset OTP
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    validateRequest
  ],
  forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post(
  '/reset-password',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    validateRequest
  ],
  resetPassword
);

/**
 * POST /api/auth/google
 * Google Sign-In
 */
router.post(
  '/google',
  [
    body('idToken')
      .notEmpty()
      .withMessage('Google ID token is required'),
    validateRequest
  ],
  googleSignIn
);

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
router.put(
  '/profile',
  authMiddleware,
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Name must not exceed 100 characters'),
    validateRequest
  ],
  updateProfile
);

export default router;
