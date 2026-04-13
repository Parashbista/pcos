import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PartnerSharingModel, PartnerConnectionModel } from '../models/partner.model';

/**
 * Generate a unique 6-character share code
 */
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Enable partner sharing and generate share code
 * POST /api/partner/enable
 */
export async function enableSharing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { sharePeriod = true, shareMood = false, shareSleep = false } = req.body;

    const shareCode = generateShareCode();

    const settings = await PartnerSharingModel.upsertSettings(userId, {
      isEnabled: true,
      shareCode,
      sharePeriod,
      shareMood,
      shareSleep,
    });

    res.status(200).json({
      message: 'Partner sharing enabled',
      settings: {
        isEnabled: settings.isEnabled,
        shareCode: settings.shareCode,
        sharePeriod: settings.sharePeriod,
        shareMood: settings.shareMood,
        shareSleep: settings.shareSleep,
      },
    });
  } catch (error) {
    console.error('Enable sharing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Disable partner sharing
 * POST /api/partner/disable
 */
export async function disableSharing(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    await PartnerSharingModel.upsertSettings(userId, {
      isEnabled: false,
    });

    res.status(200).json({ message: 'Partner sharing disabled' });
  } catch (error) {
    console.error('Disable sharing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current sharing settings
 * GET /api/partner/settings
 */
export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const settings = await PartnerSharingModel.getByUserId(userId);

    if (!settings) {
      res.status(200).json({ settings: null });
      return;
    }

    res.status(200).json({
      settings: {
        isEnabled: settings.isEnabled,
        shareCode: settings.shareCode,
        sharePeriod: settings.sharePeriod,
        shareMood: settings.shareMood,
        shareSleep: settings.shareSleep,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update sharing preferences
 * PUT /api/partner/settings
 */
export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { sharePeriod, shareMood, shareSleep } = req.body;

    const settings = await PartnerSharingModel.upsertSettings(userId, {
      sharePeriod,
      shareMood,
      shareSleep,
    });

    res.status(200).json({
      message: 'Settings updated',
      settings: {
        sharePeriod: settings.sharePeriod,
        shareMood: settings.shareMood,
        shareSleep: settings.shareSleep,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Regenerate share code
 * POST /api/partner/regenerate-code
 */
export async function regenerateCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const newCode = generateShareCode();

    const settings = await PartnerSharingModel.upsertSettings(userId, {
      shareCode: newCode,
    });

    res.status(200).json({
      message: 'Share code regenerated',
      shareCode: settings.shareCode,
    });
  } catch (error) {
    console.error('Regenerate code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Connect to partner using share code
 * POST /api/partner/connect
 */
export async function connectToPartner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { shareCode, partnerName } = req.body;

    if (!shareCode || shareCode.length !== 6) {
      res.status(400).json({ error: 'Invalid share code' });
      return;
    }

    // Find partner by share code
    const partnerSettings = await PartnerSharingModel.getByShareCode(shareCode);

    if (!partnerSettings) {
      res.status(404).json({ error: 'Invalid or expired share code' });
      return;
    }

    const partnerId = partnerSettings.userId.toString();

    // Don't allow connecting to yourself
    if (partnerId === userId) {
      res.status(400).json({ error: 'Cannot connect to yourself' });
      return;
    }

    // Create connection
    await PartnerConnectionModel.createConnection(userId, partnerId, partnerName);

    // Add to partner's connected list
    await PartnerSharingModel.addConnectedPartner(partnerId, userId);

    res.status(200).json({
      message: 'Connected to partner successfully',
      partnerId,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Already connected to this partner' });
      return;
    }
    console.error('Connect to partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get list of connected partners
 * GET /api/partner/connections
 */
export async function getConnections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const connections = await PartnerConnectionModel.getUserConnections(userId);

    res.status(200).json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Disconnect from partner
 * DELETE /api/partner/disconnect/:partnerId
 */
export async function disconnectPartner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { partnerId } = req.params;

    await PartnerConnectionModel.removeConnection(userId, partnerId);
    await PartnerSharingModel.removeConnectedPartner(partnerId, userId);

    res.status(200).json({ message: 'Disconnected from partner' });
  } catch (error) {
    console.error('Disconnect partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
