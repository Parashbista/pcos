import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as supplementModel from '../models/supplement.model';
import {
  analyzeSupplementConsistency,
  getTodaySupplementStatus,
  getAbsorptionTip,
} from '../services/supplement-analysis.service';
import { SupplementName } from '../models/supplement.types';

// ============================================
// Supplement CRUD
// ============================================

/**
 * Create a new supplement
 * POST /api/supplements
 */
export const createSupplement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, customName, dosage, frequency, timeOfDay, instruction, notes } = req.body;

    if (!name || !dosage || !frequency || !timeOfDay || !instruction) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const supplement = await supplementModel.createSupplement(userId, {
      name,
      customName,
      dosage,
      frequency,
      timeOfDay,
      instruction,
      notes,
      isActive: true,
    });

    res.status(201).json({ success: true, data: supplement });
  } catch (error: any) {
    console.error('Create supplement error:', error);
    res.status(500).json({ error: 'Failed to create supplement' });
  }
};

/**
 * Get user's supplements
 * GET /api/supplements
 */
export const getSupplements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const activeOnly = req.query.active === 'true';
    const supplements = await supplementModel.getSupplements(userId, activeOnly);

    res.json({ success: true, data: supplements });
  } catch (error: any) {
    console.error('Get supplements error:', error);
    res.status(500).json({ error: 'Failed to get supplements' });
  }
};

/**
 * Update a supplement
 * PUT /api/supplements/:id
 */
export const updateSupplement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const supplement = await supplementModel.updateSupplement(userId, id, req.body);

    if (!supplement) {
      res.status(404).json({ error: 'Supplement not found' });
      return;
    }

    res.json({ success: true, data: supplement });
  } catch (error: any) {
    console.error('Update supplement error:', error);
    res.status(500).json({ error: 'Failed to update supplement' });
  }
};

/**
 * Delete a supplement
 * DELETE /api/supplements/:id
 */
export const deleteSupplement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await supplementModel.deleteSupplement(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Supplement not found' });
      return;
    }

    res.json({ success: true, message: 'Supplement deleted' });
  } catch (error: any) {
    console.error('Delete supplement error:', error);
    res.status(500).json({ error: 'Failed to delete supplement' });
  }
};

// ============================================
// Supplement Logging
// ============================================

/**
 * Log supplement intake
 * POST /api/supplements/log
 */
export const logIntake = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { supplementId, supplementName, date, time, taken, takenWithFood, notes } = req.body;

    if (!supplementId || !date || taken === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const log = await supplementModel.logSupplementIntake(userId, {
      supplementId,
      supplementName: supplementName || 'Supplement',
      date,
      time: time || new Date().toTimeString().slice(0, 5),
      taken,
      takenWithFood: takenWithFood || false,
      notes,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    console.error('Log intake error:', error);
    res.status(500).json({ error: 'Failed to log intake' });
  }
};

/**
 * Get supplement logs
 * GET /api/supplements/logs?startDate=&endDate=&supplementId=
 */
export const getLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate, supplementId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const logs = await supplementModel.getSupplementLogs(
      userId,
      startDate as string,
      endDate as string,
      supplementId as string
    );

    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
};

/**
 * Get today's supplement status
 * GET /api/supplements/today
 */
export const getTodayStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const status = await getTodaySupplementStatus(userId);
    res.json({ success: true, data: status });
  } catch (error: any) {
    console.error('Get today status error:', error);
    res.status(500).json({ error: 'Failed to get today status' });
  }
};

// ============================================
// Analysis & Insights
// ============================================

/**
 * Get supplement consistency analysis
 * GET /api/supplements/analysis
 */
export const getAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const analysis = await analyzeSupplementConsistency(userId);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
};

/**
 * Get absorption tip for a supplement
 * GET /api/supplements/tip/:supplementName
 */
export const getSupplementTip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplementName } = req.params;
    const tip = getAbsorptionTip(supplementName as SupplementName);

    res.json({ success: true, data: { supplementName, tip } });
  } catch (error: any) {
    console.error('Get tip error:', error);
    res.status(500).json({ error: 'Failed to get tip' });
  }
};

// ============================================
// Diet Goals & Logging
// ============================================

/**
 * Create diet goal
 * POST /api/supplements/diet-goals
 */
export const createDietGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, targetMeals } = req.body;

    if (!name || !targetMeals) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const goal = await supplementModel.createDietGoal(userId, {
      name,
      description,
      targetMeals,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error: any) {
    console.error('Create diet goal error:', error);
    res.status(500).json({ error: 'Failed to create diet goal' });
  }
};

/**
 * Get diet goals
 * GET /api/supplements/diet-goals
 */
export const getDietGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const goals = await supplementModel.getDietGoals(userId);
    res.json({ success: true, data: goals });
  } catch (error: any) {
    console.error('Get diet goals error:', error);
    res.status(500).json({ error: 'Failed to get diet goals' });
  }
};

/**
 * Log diet/meal
 * POST /api/supplements/diet-log
 */
export const logDiet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date, mealType, description, isHealthy, tags, notes } = req.body;

    if (!date || !mealType || !description) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const log = await supplementModel.logDiet(userId, {
      date,
      mealType,
      description,
      isHealthy: isHealthy ?? true,
      tags: tags || [],
      notes,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    console.error('Log diet error:', error);
    res.status(500).json({ error: 'Failed to log diet' });
  }
};

/**
 * Get diet logs
 * GET /api/supplements/diet-logs?startDate=&endDate=
 */
export const getDietLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const logs = await supplementModel.getDietLogs(
      userId,
      startDate as string,
      endDate as string
    );

    res.json({ success: true, data: logs });
  } catch (error: any) {
    console.error('Get diet logs error:', error);
    res.status(500).json({ error: 'Failed to get diet logs' });
  }
};
