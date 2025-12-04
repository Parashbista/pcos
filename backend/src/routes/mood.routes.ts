import { Router } from 'express';
import * as moodController from '../controllers/mood.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Mood entries
router.post('/entries', moodController.createMoodEntry);
router.get('/entries', moodController.getMoodEntries);
router.get('/entries/:date', moodController.getMoodEntryByDate);
router.put('/entries/:id', moodController.updateMoodEntry);
router.delete('/entries/:id', moodController.deleteMoodEntry);

// Mood statistics
router.get('/stats', moodController.getMoodStats);

export default router;
