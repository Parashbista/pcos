import { Router } from 'express';
import { testAIService, testAIJSON } from '../controllers/ai.controller';

const router = Router();

/**
 * GET /api/ai/test
 * Test AI service connection
 */
router.get('/test', testAIService);

/**
 * GET /api/ai/test-json
 * Test AI JSON response generation
 */
router.get('/test-json', testAIJSON);

export default router;
