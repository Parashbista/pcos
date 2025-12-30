import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as symptomService from '../services/symptom.service';
import { getSymptomRecommendations, getQuickTip } from '../services/symptom-recommendation.service';
import { CreateSymptomEntryData, UpdateSymptomEntryData, SymptomName } from '../models/symptom.types';

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


/**
 * Get AI-powered recommendations based on symptoms
 * POST /api/symptoms/recommendations
 */
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
      res.status(400).json({ error: 'Missing required field: symptoms (array)' });
      return;
    }

    // Get recent symptom history for context
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];

    const recentEntries = await symptomService.getSymptomEntries(userId, startDateStr, endDate);
    const recentHistory = recentEntries.map(e => ({
      date: e.date,
      symptoms: e.symptoms,
    }));

    const analysis = await getSymptomRecommendations(symptoms, recentHistory);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Get symptom recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

/**
 * Get quick tip for a specific symptom
 * GET /api/symptoms/tip/:symptomName
 */
export const getSymptomTip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symptomName } = req.params;
    const tip = getQuickTip(symptomName as SymptomName);

    res.json({
      success: true,
      data: { symptomName, tip },
    });
  } catch (error: any) {
    console.error('Get symptom tip error:', error);
    res.status(500).json({ error: 'Failed to get tip' });
  }
};

/**
 * Log symptoms and get AI recommendations in one call
 * POST /api/symptoms/log-with-recommendations
 */
export const logWithRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Save the entry
    const entry = await symptomService.createSymptomEntry(userId, data);

    // Get recent history for AI context
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];

    const recentEntries = await symptomService.getSymptomEntries(userId, startDateStr, endDate);
    const recentHistory = recentEntries.map(e => ({
      date: e.date,
      symptoms: e.symptoms,
    }));

    // Get AI recommendations
    const analysis = await getSymptomRecommendations(data.symptoms, recentHistory);

    res.status(201).json({
      success: true,
      data: {
        entry,
        analysis,
      },
    });
  } catch (error: any) {
    console.error('Log with recommendations error:', error);
    res.status(500).json({ error: 'Failed to log symptoms' });
  }
};
