/**
 * Mood Routes - AI-powered recommendations, feedback, and mood tracking
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getMoodRecommendations,
  submitFeedback,
  getFeedbackStats,
  createOrUpdateMoodEntry,
  getMoodEntryByDate,
  getMoodEntries,
  deleteMoodEntry,
  getMoodStats,
  getMotivationalQuote,
  submitQuoteFeedback,
  getTodayQuote,
} from '../controllers/mood.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ============================================
// Mood Entry CRUD Routes
// ============================================

/**
 * POST /api/mood/entries
 * Create or update mood entry for a date
 */
router.post('/entries', createOrUpdateMoodEntry);

/**
 * GET /api/mood/entries/:date
 * Get mood entry by date
 */
router.get('/entries/:date', getMoodEntryByDate);

/**
 * GET /api/mood/entries
 * Get mood entries for date range
 */
router.get('/entries', getMoodEntries);

/**
 * DELETE /api/mood/entries/:id
 * Delete mood entry
 */
router.delete('/entries/:id', deleteMoodEntry);

/**
 * GET /api/mood/stats
 * Get mood statistics for date range
 */
router.get('/stats', getMoodStats);

// ============================================
// AI Recommendations & Feedback Routes
// ============================================

/**
 * POST /api/mood/recommendations
 * Get AI-generated recommendations based on mood
 */
router.post('/recommendations', getMoodRecommendations);

/**
 * POST /api/mood/feedback
 * Submit feedback for a recommendation
 */
router.post('/feedback', submitFeedback);

/**
 * GET /api/mood/feedback-stats
 * Get user's feedback statistics
 */
router.get('/feedback-stats', getFeedbackStats);

// ============================================
// Quote Routes
// ============================================

/**
 * POST /api/mood/quote
 * Generate a motivational quote based on mood
 */
router.post('/quote', getMotivationalQuote);

/**
 * POST /api/mood/quote-feedback
 * Submit feedback for a quote (helpful/not helpful)
 */
router.post('/quote-feedback', submitQuoteFeedback);

/**
 * GET /api/mood/today-quote
 * Get today's quote for dashboard
 */
router.get('/today-quote', getTodayQuote);

export default router;
