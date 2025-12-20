import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as symptomService from '../services/symptom.service';
import { CreateSymptomEntryData, UpdateSymptomEntryData } from '../models/symptom.types';

/**
 * Create or update symptom entry
 * POST /api/symptoms
 */
export const createSymptomEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreateSymptomEntryData = req.body;

    if (!data.date || !data.symptoms) {
      res.status(400).json({ error: 'Missing required fields: date, symptoms' });
      return;
    }

    const entry = await symptomService.createSymptomEntry(userId, data);
    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Create symptom entry error:', error);
    res.status(500).json({ error: 'Failed to create symptom entry' });
  }
};

/**
 * Get symptom entries
 * GET /api/symptoms?startDate=&endDate=
 */
export const getSymptomEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const entries = await symptomService.getSymptomEntries(
      userId,
      startDate as string,
      endDate as string
    );
    res.json(entries);
  } catch (error: any) {
    console.error('Get symptom entries error:', error);
    res.status(500).json({ error: 'Failed to get symptom entries' });
  }
};

/**
 * Get symptom entry by date
 * GET /api/symptoms/date/:date
 */
export const getSymptomEntryByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date } = req.params;
    const entry = await symptomService.getSymptomEntryByDate(userId, date);

    if (!entry) {
      res.status(404).json({ error: 'Symptom entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Get symptom entry by date error:', error);
    res.status(500).json({ error: 'Failed to get symptom entry' });
  }
};

/**
 * Update symptom entry
 * PUT /api/symptoms/:id
 */
export const updateSymptomEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const data: UpdateSymptomEntryData = req.body;

    const entry = await symptomService.updateSymptomEntry(userId, id, data);

    if (!entry) {
      res.status(404).json({ error: 'Symptom entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Update symptom entry error:', error);
    res.status(500).json({ error: 'Failed to update symptom entry' });
  }
};

/**
 * Delete symptom entry
 * DELETE /api/symptoms/:id
 */
export const deleteSymptomEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await symptomService.deleteSymptomEntry(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Symptom entry not found' });
      return;
    }

    res.json({ message: 'Symptom entry deleted successfully' });
  } catch (error: any) {
    console.error('Delete symptom entry error:', error);
    res.status(500).json({ error: 'Failed to delete symptom entry' });
  }
};

/**
 * Get symptom statistics
 * GET /api/symptoms/stats?days=30
 */
export const getSymptomStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const days = parseInt(req.query.days as string) || 30;
    const stats = await symptomService.getSymptomStats(userId, days);
    res.json(stats);
  } catch (error: any) {
    console.error('Get symptom stats error:', error);
    res.status(500).json({ error: 'Failed to get symptom statistics' });
  }
};
