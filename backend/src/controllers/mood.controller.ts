import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as moodService from '../services/mood.service';
import { CreateMoodEntryData, UpdateMoodEntryData } from '../models/mood.types';

/**
 * Create or update mood entry for a date
 * POST /api/mood/entries
 */
export const createMoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreateMoodEntryData = req.body;

    if (!data.date || !data.mood || !data.energy) {
      res.status(400).json({ error: 'Missing required fields: date, mood, energy' });
      return;
    }

    if (data.mood < 1 || data.mood > 5 || data.energy < 1 || data.energy > 5) {
      res.status(400).json({ error: 'Mood and energy must be between 1 and 5' });
      return;
    }

    const entry = await moodService.createMoodEntry(userId, data);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Create mood entry error:', error);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
};

/**
 * Get mood entry for a specific date
 * GET /api/mood/entries/:date
 */
export const getMoodEntryByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date } = req.params;
    const entry = await moodService.getMoodEntryByDate(userId, date);

    if (!entry) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Get mood entry error:', error);
    res.status(500).json({ error: 'Failed to get mood entry' });
  }
};

/**
 * Get mood entries for a date range
 * GET /api/mood/entries?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getMoodEntries = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const entries = await moodService.getMoodEntries(
      userId,
      startDate as string,
      endDate as string
    );

    res.json(entries);
  } catch (error: any) {
    console.error('Get mood entries error:', error);
    res.status(500).json({ error: 'Failed to get mood entries' });
  }
};

/**
 * Update a mood entry
 * PUT /api/mood/entries/:id
 */
export const updateMoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data: UpdateMoodEntryData = req.body;

    const entry = await moodService.updateMoodEntry(userId, id, data);

    if (!entry) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Update mood entry error:', error);
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
};

/**
 * Delete a mood entry
 * DELETE /api/mood/entries/:id
 */
export const deleteMoodEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await moodService.deleteMoodEntry(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
};

/**
 * Get mood statistics
 * GET /api/mood/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getMoodStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const stats = await moodService.getMoodStats(
      userId,
      startDate as string,
      endDate as string
    );

    res.json(stats);
  } catch (error: any) {
    console.error('Get mood stats error:', error);
    res.status(500).json({ error: 'Failed to get mood statistics' });
  }
};
