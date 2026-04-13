import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  enableSharing,
  disableSharing,
  getSettings,
  updateSettings,
  regenerateCode,
  connectToPartner,
  getConnections,
  disconnectPartner,
} from '../controllers/partner.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/partner/enable
 * Enable partner sharing
 */
router.post(
  '/enable',
  [
    body('sharePeriod').optional().isBoolean(),
    body('shareMood').optional().isBoolean(),
    body('shareSleep').optional().isBoolean(),
    validateRequest,
  ],
  enableSharing
);

/**
 * POST /api/partner/disable
 * Disable partner sharing
 */
router.post('/disable', disableSharing);

/**
 * GET /api/partner/settings
 * Get current sharing settings
 */
router.get('/settings', getSettings);

/**
 * PUT /api/partner/settings
 * Update sharing preferences
 */
router.put(
  '/settings',
  [
    body('sharePeriod').optional().isBoolean(),
    body('shareMood').optional().isBoolean(),
    body('shareSleep').optional().isBoolean(),
    validateRequest,
  ],
  updateSettings
);

/**
 * POST /api/partner/regenerate-code
 * Regenerate share code
 */
router.post('/regenerate-code', regenerateCode);

/**
 * POST /api/partner/connect
 * Connect to partner using share code
 */
router.post(
  '/connect',
  [
    body('shareCode')
      .notEmpty()
      .withMessage('Share code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('Share code must be 6 characters'),
    body('partnerName').optional().isString().trim(),
    validateRequest,
  ],
  connectToPartner
);

/**
 * GET /api/partner/connections
 * Get list of connected partners
 */
router.get('/connections', getConnections);

/**
 * DELETE /api/partner/disconnect/:partnerId
 * Disconnect from partner
 */
router.delete(
  '/disconnect/:partnerId',
  [
    param('partnerId').notEmpty().withMessage('Partner ID is required'),
    validateRequest,
  ],
  disconnectPartner
);

export default router;
