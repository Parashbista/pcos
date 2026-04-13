import { Router } from 'express';
import {
  chat,
  getSuggestions,
  getHistory,
  getConversation,
  deleteConversation
} from '../controllers/chatbot.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/chatbot/chat
 * Send a message to the PCOS health assistant
 */
router.post('/chat', authMiddleware, chat);

/**
 * GET /api/chatbot/suggestions
 * Get suggested questions (personalized if authenticated)
 */
router.get('/suggestions', authMiddleware, getSuggestions);

/**
 * GET /api/chatbot/history
 * Get user's conversation history
 */
router.get('/history', authMiddleware, getHistory);

/**
 * GET /api/chatbot/conversation/:id
 * Get a specific conversation
 */
router.get('/conversation/:id', authMiddleware, getConversation);

/**
 * DELETE /api/chatbot/conversation/:id
 * Delete a conversation
 */
router.delete('/conversation/:id', authMiddleware, deleteConversation);

export default router;
