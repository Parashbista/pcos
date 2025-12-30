import { Router } from 'express';
import * as sleepController from '../controllers/sleep.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Sleep entries
router.post('/entries', sleepController.createSleepEntry);
router.get('/entries', sleepController.getSleepEntries);
router.get('/entries/:date', sleepController.getSleepEntryByDate);
router.put('/entries/:id', sleepController.updateSleepEntry);
router.delete('/entries/:id', sleepController.deleteSleepEntry);

// Sleep goal
router.post('/goal', sleepController.setSleepGoal);
router.get('/goal', sleepController.getSleepGoal);

// Sleep statistics
router.get('/stats', sleepController.getSleepStats);

// Sleep analysis (weekly patterns & alerts)
router.get('/analysis', sleepController.getSleepAnalysis);
router.get('/dashboard-summary', sleepController.getSleepDashboardSummary);

export default router;
