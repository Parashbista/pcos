import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as sleepService from '../services/sleep.service';
import { CreateSleepEntryData, UpdateSleepEntryData, SetSleepGoalData } from '../models/sleep.types';

/**
 * Create or update sleep entry for a date
 * POST /api/sleep/entries
 */
export const createSleepEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreateSleepEntryData = req.body;

    // Validate required fields
    if (!data.date || !data.bedtime || !data.wakeTime || !data.quality) {
      res.status(400).json({ error: 'Missing required fields: date, bedtime, wakeTime, quality' });
      return;
    }

    // Validate quality range
    if (data.quality < 1 || data.quality > 5) {
      res.status(400).json({ error: 'Quality must be between 1 and 5' });
      return;
    }

    const entry = await sleepService.createSleepEntry(userId, data);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Create sleep entry error:', error);
    res.status(500).json({ error: 'Failed to create sleep entry' });
  }
};

/**
 * Get sleep entry for a specific date
 * GET /api/sleep/entries/:date
 */
export const getSleepEntryByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date } = req.params;
    const entry = await sleepService.getSleepEntryByDate(userId, date);

    if (!entry) {
      res.status(404).json({ error: 'Sleep entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Get sleep entry error:', error);
    res.status(500).json({ error: 'Failed to get sleep entry' });
  }
};

/**
 * Get sleep entries for a date range
 * GET /api/sleep/entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getSleepEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing required query params: startDate, endDate' });
      return;
    }

    const entries = await sleepService.getSleepEntries(
      userId,
      startDate as string,
      endDate as string
    );

    res.json(entries);
  } catch (error: any) {
    console.error('Get sleep entries error:', error);
    res.status(500).json({ error: 'Failed to get sleep entries' });
  }
};

/**
 * Update a sleep entry
 * PUT /api/sleep/entries/:id
 */
export const updateSleepEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data: UpdateSleepEntryData = req.body;

    const entry = await sleepService.updateSleepEntry(userId, id, data);

    if (!entry) {
      res.status(404).json({ error: 'Sleep entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Update sleep entry error:', error);
    res.status(500).json({ error: 'Failed to update sleep entry' });
  }
};

/**
 * Delete a sleep entry
 * DELETE /api/sleep/entries/:id
 */
export const deleteSleepEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await sleepService.deleteSleepEntry(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Sleep entry not found' });
      return;
    }

    res.json({ message: 'Sleep entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete sleep entry error:', error);
    res.status(500).json({ error: 'Failed to delete sleep entry' });
  }
};

/**
 * Set sleep goal
 * POST /api/sleep/goal
 */
export const setSleepGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: SetSleepGoalData = req.body;

    if (!data.targetBedtime || !data.targetWakeTime) {
      res.status(400).json({ error: 'Missing required fields: targetBedtime, targetWakeTime' });
      return;
    }

    const goal = await sleepService.setSleepGoal(userId, data);
    res.status(201).json(goal);
  } catch (error: any) {
    console.error('Set sleep goal error:', error);
    res.status(500).json({ error: 'Failed to set sleep goal' });
  }
};

/**
 * Get current sleep goal
 * GET /api/sleep/goal
 */
export const getSleepGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goal = await sleepService.getSleepGoal(userId);
    res.json(goal);
  } catch (error: any) {
    console.error('Get sleep goal error:', error);
    res.status(500).json({ error: 'Failed to get sleep goal' });
  }
};

/**
 * Get sleep statistics
 * GET /api/sleep/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getSleepStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Missing required query params: startDate, endDate' });
      return;
    }

    const stats = await sleepService.getSleepStats(
      userId,
      startDate as string,
      endDate as string
    );

    res.json(stats);
  } catch (error: any) {
    console.error('Get sleep stats error:', error);
    res.status(500).json({ error: 'Failed to get sleep statistics' });
  }
};
