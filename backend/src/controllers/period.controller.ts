import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as periodService from '../services/period.service';
import { CreatePeriodEntryData, UpdatePeriodEntryData, SetPeriodSettingsData } from '../models/period.types';

/**
 * Create period entry
 * POST /api/period/entries
 */
export const createPeriodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreatePeriodEntryData = req.body;

    if (!data.startDate) {
      res.status(400).json({ error: 'Missing required field: startDate' });
      return;
    }

    const entry = await periodService.createPeriodEntry(userId, data);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Create period entry error:', error);
    res.status(500).json({ error: 'Failed to create period entry' });
  }
};

/**
 * Get period entries
 * GET /api/period/entries?limit=12
 */
export const getPeriodEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 12;
    const entries = await periodService.getPeriodEntries(userId, limit);
    res.json(entries);
  } catch (error: any) {
    console.error('Get period entries error:', error);
    res.status(500).json({ error: 'Failed to get period entries' });
  }
};

/**
 * Update period entry
 * PUT /api/period/entries/:id
 */
export const updatePeriodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data: UpdatePeriodEntryData = req.body;

    const entry = await periodService.updatePeriodEntry(userId, id, data);

    if (!entry) {
      res.status(404).json({ error: 'Period entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Update period entry error:', error);
    res.status(500).json({ error: 'Failed to update period entry' });
  }
};

/**
 * Delete period entry
 * DELETE /api/period/entries/:id
 */
export const deletePeriodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await periodService.deletePeriodEntry(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Period entry not found' });
      return;
    }

    res.json({ message: 'Period entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete period entry error:', error);
    res.status(500).json({ error: 'Failed to delete period entry' });
  }
};

/**
 * Get period settings
 * GET /api/period/settings
 */
export const getPeriodSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const settings = await periodService.getPeriodSettings(userId);
    res.json(settings);
  } catch (error: any) {
    console.error('Get period settings error:', error);
    res.status(500).json({ error: 'Failed to get period settings' });
  }
};

/**
 * Update period settings
 * PUT /api/period/settings
 */
export const updatePeriodSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: SetPeriodSettingsData = req.body;
    const settings = await periodService.updatePeriodSettings(userId, data);
    res.json(settings);
  } catch (error: any) {
    console.error('Update period settings error:', error);
    res.status(500).json({ error: 'Failed to update period settings' });
  }
};

/**
 * Get period statistics
 * GET /api/period/stats
 */
export const getPeriodStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const stats = await periodService.getPeriodStats(userId);
    res.json(stats);
  } catch (error: any) {
    console.error('Get period stats error:', error);
    res.status(500).json({ error: 'Failed to get period statistics' });
  }
};

/**
 * Get period prediction
 * GET /api/period/prediction
 */
export const getPeriodPrediction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const prediction = await periodService.getPeriodPrediction(userId);
    res.json(prediction);
  } catch (error: any) {
    console.error('Get period prediction error:', error);
    res.status(500).json({ error: 'Failed to get period prediction' });
  }
};


// Import cycle irregularity service
import {
  analyzeCycleIrregularity,
  getCycleStatusForDashboard,
} from '../services/cycle-irregularity.service';

/**
 * Get cycle irregularity analysis with AI recommendations
 * GET /api/period/irregularity-analysis
 */
export const getCycleIrregularityAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const analysis = await analyzeCycleIrregularity(userId);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Get cycle irregularity analysis error:', error);
    res.status(500).json({ error: 'Failed to get cycle analysis' });
  }
};

/**
 * Get cycle status for dashboard (quick summary)
 * GET /api/period/dashboard-status
 */
export const getCycleDashboardStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = await getCycleStatusForDashboard(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Get cycle dashboard status error:', error);
    res.status(500).json({ error: 'Failed to get cycle status' });
  }
};
