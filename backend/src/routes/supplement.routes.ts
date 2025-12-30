import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as supplementController from '../controllers/supplement.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Supplement CRUD
router.post('/', supplementController.createSupplement);
router.get('/', supplementController.getSupplements);
router.put('/:id', supplementController.updateSupplement);
router.delete('/:id', supplementController.deleteSupplement);

// Supplement logging
router.post('/log', supplementController.logIntake);
router.get('/logs', supplementController.getLogs);
router.get('/today', supplementController.getTodayStatus);

// Analysis & insights
router.get('/analysis', supplementController.getAnalysis);
router.get('/tip/:supplementName', supplementController.getSupplementTip);

// Diet goals & logging
router.post('/diet-goals', supplementController.createDietGoal);
router.get('/diet-goals', supplementController.getDietGoals);
router.post('/diet-log', supplementController.logDiet);
router.get('/diet-logs', supplementController.getDietLogs);

export default router;
