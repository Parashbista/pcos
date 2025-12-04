import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
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

export default router;
