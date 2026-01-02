import { Request, Response } from 'express';
import { getAIService } from '../services/ai.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

/**
 * PCOS Health Assistant Chatbot
 * POST /api/chatbot/chat
 */
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { message, conversationHistory = [] } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Message is required'
      });
      return;
    }

    const aiService = getAIService();

    // Build conversation context
    const historyContext = conversationHistory
      .slice(-6) // Keep last 6 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a friendly PCOS health assistant. 

RESPONSE FORMAT - ALWAYS follow this:
• Keep answers SHORT and CONCISE (max 3-4 bullet points)
• Use bullet points (•) for clarity
• Each point should be 1 sentence max
• Be warm but brief
• Add a quick tip or encouragement at the end

RULES:
• You're an AI, not a doctor - remind users to consult healthcare providers for serious concerns
• Focus on practical, actionable advice
• Be supportive and non-judgmental

${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}User's question: ${message}

Respond in short bullet points:`;

    const result = await aiService.generate({
      prompt: systemPrompt,
      maxTokens: 250,
      temperature: 0.7
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        response: result.content.trim(),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate response'
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}

/**
 * Get suggested questions for the chatbot
 * GET /api/chatbot/suggestions
 */
export async function getSuggestions(_req: Request, res: Response): Promise<void> {
  console.log('🤖 getSuggestions endpoint called');
  
  const suggestions = [
    "What are common PCOS symptoms?",
    "How can I manage PCOS naturally?",
    "What foods should I eat with PCOS?",
    "How does sleep affect PCOS?",
    "Why is my period irregular?",
    "How can I improve my mood with PCOS?",
    "What supplements help with PCOS?",
    "How does stress affect PCOS?"
  ];

  console.log('🤖 Returning suggestions:', suggestions.length, 'items');
  
  res.status(200).json({
    success: true,
    suggestions
  });
}
