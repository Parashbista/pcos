import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as symptomController from '../controllers/symptom.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Symptom entries
router.post('/', symptomController.createSymptomEntry);
router.get('/', symptomController.getSymptomEntries);
router.get('/date/:date', symptomController.getSymptomEntryByDate);
router.put('/:id', symptomController.updateSymptomEntry);
router.delete('/:id', symptomController.deleteSymptomEntry);

// Statistics
router.get('/stats', symptomController.getSymptomStats);

export default router;
