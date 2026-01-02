import { Router } from 'express';
import { chat, getSuggestions } from '../controllers/chatbot.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/chatbot/chat
 * Send a message to the PCOS health assistant
 */
router.post('/chat', authMiddleware, chat);

/**
 * GET /api/chatbot/suggestions
 * Get suggested questions
 */
router.get('/suggestions', getSuggestions);

export default router;
