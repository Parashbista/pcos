/**
 * Mood Controller - Handles mood recommendations and feedback
 */

import { Request, Response } from 'express';
import { getRecommendations } from '../services/mood-recommendation.service';
import { generateMoodQuote } from '../services/mood-quote.service';
import { createFeedback, getUserFeedbackStats } from '../models/feedback.model';
import { CreateFeedbackData } from '../models/feedback.types';

/**
 * Get AI-powered recommendations based on mood
 * POST /api/moods/recommendations
 */
export async function getMoodRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { mood, factors = [], context = {} } = req.body;

    if (!mood || mood < 1 || mood > 5) {
      res.status(400).json({ 
        success: false, 
        error: 'Mood must be a number between 1 and 5' 
      });
      return;
    }

    const recommendations = await getRecommendations(userId, mood, factors);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
}

/**
 * Submit feedback for a recommendation
 * POST /api/moods/feedback
 */
export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { moodLevel, recommendationTitle, recommendationType, feedback, comment, moodFactors } = req.body;

    // Validation
    if (!moodLevel || !recommendationTitle || !recommendationType || !feedback) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: moodLevel, recommendationTitle, recommendationType, feedback',
      });
      return;
    }

    const validFeedback = ['good', 'bad', 'improve'];
    if (!validFeedback.includes(feedback)) {
      res.status(400).json({
        success: false,
        error: 'Feedback must be one of: good, bad, improve',
      });
      return;
    }

    const validTypes = ['breathing', 'exercise', 'activity', 'affirmation'];
    if (!validTypes.includes(recommendationType)) {
      res.status(400).json({
        success: false,
        error: 'recommendationType must be one of: breathing, exercise, activity, affirmation',
      });
      return;
    }

    const feedbackData: CreateFeedbackData = {
      moodLevel,
      recommendationTitle,
      recommendationType,
      feedback,
      comment,
      moodFactors,
    };

    const result = await createFeedback(userId, feedbackData);
    const stats = await getUserFeedbackStats(userId);

    res.status(201).json({
      success: true,
      message: "Feedback recorded. We'll use this to improve your recommendations!",
      data: {
        feedbackId: result.id,
        totalFeedback: stats.totalFeedback,
        preferenceProfile: {
          preferredTypes: stats.topPreferences,
        },
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
    });
  }
}

/**
 * Get user's feedback statistics
 * GET /api/moods/feedback-stats
 */
export async function getFeedbackStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const stats = await getUserFeedbackStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get feedback statistics',
    });
  }
}

// ============================================
// Mood Entry CRUD Operations
// ============================================

import { getMoodEntriesCollection } from '../models/mood.model';
import { ObjectId } from 'mongodb';

/**
 * Create or update mood entry
 * POST /api/mood/entries
 */
export async function createOrUpdateMoodEntry(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { date, mood, energy, factors, journalEntry, gratitude, goals } = req.body;

    if (!date || !mood || !energy) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: date, mood, energy',
      });
      return;
    }

    const collection = getMoodEntriesCollection();
    const now = new Date();

    const entry = {
      userId,
      date,
      mood,
      energy,
      factors: factors || [],
      journalEntry: journalEntry || null,
      gratitude: gratitude || null,
      goals: goals || null,
      updatedAt: now,
    };

    // Upsert - update if exists, insert if not
    const result = await collection.findOneAndUpdate(
      { userId, date },
      { $set: entry, $setOnInsert: { createdAt: now } },
      { upsert: true, returnDocument: 'after' }
    );

    // Generate AI quote for the mood
    const quote = await generateMoodQuote(mood, factors || []);

    res.status(200).json({
      success: true,
      data: {
        id: result?._id?.toString(),
        ...entry,
        quote,
      },
    });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create mood entry',
    });
  }
}

/**
 * Get mood entry by date
 * GET /api/mood/entries/:date
 */
export async function getMoodEntryByDate(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { date } = req.params;
    const collection = getMoodEntriesCollection();

    const entry = await collection.findOne({ userId, date });

    if (!entry) {
      res.status(404).json({ success: false, error: 'Mood entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: entry._id.toString(),
        ...entry,
      },
    });
  } catch (error) {
    console.error('Error getting mood entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get mood entry',
    });
  }
}

/**
 * Get mood entries for date range
 * GET /api/mood/entries?startDate=&endDate=
 */
export async function getMoodEntries(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const collection = getMoodEntriesCollection();

    const query: any = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await collection.find(query).sort({ date: -1 }).toArray();

    res.status(200).json({
      success: true,
      data: entries.map((e) => ({
        id: e._id.toString(),
        ...e,
      })),
    });
  } catch (error) {
    console.error('Error getting mood entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get mood entries',
    });
  }
}

/**
 * Delete mood entry
 * DELETE /api/mood/entries/:id
 */
export async function deleteMoodEntry(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const collection = getMoodEntriesCollection();

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, error: 'Mood entry not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Mood entry deleted',
    });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mood entry',
    });
  }
}

/**
 * Get mood statistics
 * GET /api/mood/stats?startDate=&endDate=
 */
export async function getMoodStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { startDate, endDate } = req.query;
    const collection = getMoodEntriesCollection();

    const query: any = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const entries = await collection.find(query).toArray();

    if (entries.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          averageMood: 0,
          averageEnergy: 0,
          totalEntries: 0,
          moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          energyDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          factorFrequency: {},
          entriesWithJournal: 0,
        },
      });
      return;
    }

    const moodDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const energyDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const factorFrequency: Record<string, number> = {};
    let totalMood = 0;
    let totalEnergy = 0;
    let entriesWithJournal = 0;

    entries.forEach((e) => {
      totalMood += e.mood;
      totalEnergy += e.energy;
      moodDistribution[e.mood]++;
      energyDistribution[e.energy]++;
      if (e.journalEntry) entriesWithJournal++;
      (e.factors || []).forEach((f: string) => {
        factorFrequency[f] = (factorFrequency[f] || 0) + 1;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        averageMood: totalMood / entries.length,
        averageEnergy: totalEnergy / entries.length,
        totalEntries: entries.length,
        moodDistribution,
        energyDistribution,
        factorFrequency,
        entriesWithJournal,
      },
    });
  } catch (error) {
    console.error('Error getting mood stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get mood statistics',
    });
  }
}


/**
 * Generate a motivational quote based on mood
 * POST /api/mood/quote
 */
export async function getMotivationalQuote(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { mood, factors = [] } = req.body;

    if (!mood || mood < 1 || mood > 5) {
      res.status(400).json({
        success: false,
        error: 'Mood must be a number between 1 and 5',
      });
      return;
    }

    const quote = await generateMoodQuote(mood, factors);

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quote',
    });
  }
}

/**
 * Submit feedback for a quote
 * POST /api/mood/quote-feedback
 */
export async function submitQuoteFeedback(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { quote, helpful, mood } = req.body;

    if (!quote || helpful === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: quote, helpful',
      });
      return;
    }

    // Store quote feedback (can be used to improve AI prompts later)
    const feedbackData: CreateFeedbackData = {
      moodLevel: mood || 3,
      recommendationTitle: quote.substring(0, 50),
      recommendationType: 'affirmation',
      feedback: helpful ? 'good' : 'bad',
      comment: quote,
      moodFactors: [],
    };

    await createFeedback(userId, feedbackData);

    res.status(200).json({
      success: true,
      message: helpful ? 'Thanks for the feedback! 💕' : 'Thanks! We\'ll try to do better.',
    });
  } catch (error) {
    console.error('Error submitting quote feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
    });
  }
}

/**
 * Get today's quote for dashboard
 * GET /api/mood/today-quote
 */
export async function getTodayQuote(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const collection = getMoodEntriesCollection();
    const today = new Date().toISOString().split('T')[0];

    // Get today's mood entry
    const entry = await collection.findOne({ userId, date: today });

    if (entry && entry.quote) {
      res.status(200).json({
        success: true,
        data: {
          quote: entry.quote,
          mood: entry.mood,
          hasEntry: true,
        },
      });
      return;
    }

    // If no entry today, generate a general motivational quote
    const quote = await generateMoodQuote(3, []);

    res.status(200).json({
      success: true,
      data: {
        quote,
        mood: null,
        hasEntry: false,
      },
    });
  } catch (error) {
    console.error('Error getting today quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quote',
    });
  }
}
