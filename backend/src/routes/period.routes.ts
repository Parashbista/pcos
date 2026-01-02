import { Router } from 'express';
import * as periodController from '../controllers/period.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Period entries
router.post('/entries', periodController.createPeriodEntry);
router.get('/entries', periodController.getPeriodEntries);
router.put('/entries/:id', periodController.updatePeriodEntry);
router.delete('/entries/:id', periodController.deletePeriodEntry);

// Period settings
router.get('/settings', periodController.getPeriodSettings);
router.put('/settings', periodController.updatePeriodSettings);

// Statistics and prediction
router.get('/stats', periodController.getPeriodStats);
router.get('/prediction', periodController.getPeriodPrediction);

// Cycle irregularity analysis
router.get('/irregularity-analysis', periodController.getCycleIrregularityAnalysis);
router.get('/dashboard-status', periodController.getCycleDashboardStatus);

export default router;
