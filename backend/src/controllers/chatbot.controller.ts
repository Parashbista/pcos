import { Request, Response } from 'express';
import { getAIService, resetAIService } from '../services/ai.service';
import { ChatModel } from '../models/chat.model';
import { getUserHealthContext, buildHealthContextPrompt } from '../services/chatbot.service';

interface AuthRequest extends Request {
  userId?: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
}

/**
 * PCOS Health Assistant Chatbot
 * POST /api/chatbot/chat
 */
export async function chat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { message, conversationId } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    console.log('[Chatbot] Processing message:', message);

    // Get or create conversation
    let conversation = conversationId
      ? await ChatModel.getConversationById(userId, conversationId)
      : await ChatModel.getOrCreateConversation(userId);

    if (!conversation) {
      conversation = await ChatModel.getOrCreateConversation(userId);
    }

    console.log('[Chatbot] Conversation ID:', conversation.id);

    // Save user message
    await ChatModel.addMessage(userId, conversation.id!, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    console.log('[Chatbot] User message saved');

    // Get user's health context for personalization
    const healthContext = await getUserHealthContext(userId);
    const healthContextPrompt = buildHealthContextPrompt(healthContext);

    console.log('[Chatbot] Health context loaded');

    // Build conversation history from saved messages
    const historyContext = conversation.messages
      .slice(-6)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a friendly PCOS health assistant with access to the user's health data.

RESPONSE FORMAT - ALWAYS follow this:
• Keep answers SHORT and CONCISE (max 3-4 bullet points)
• Use bullet points (•) for clarity
• Each point should be 1 sentence max
• Be warm but brief
• Personalize based on user's health data when relevant
• Add a quick tip or encouragement at the end

RULES:
• You're an AI, not a doctor - remind users to consult healthcare providers for serious concerns
• Focus on practical, actionable advice
• Be supportive and non-judgmental
• Reference their health data naturally (e.g., "I see your mood has been low...")
${healthContextPrompt}
${historyContext ? `\nPrevious conversation:\n${historyContext}\n` : ''}
User's question: ${message}

Respond in short bullet points:`;

    console.log('[Chatbot] Calling AI service...');
    // Force reset AI service to pick up new env vars
    resetAIService();
    const aiService = getAIService();
    const providerInfo = aiService.getProviderInfo();
    console.log('[Chatbot] AI Provider Info:', providerInfo);
    
    const result = await aiService.generate({
      prompt: systemPrompt,
      maxTokens: 250,
      temperature: 0.7
    });

    console.log('[Chatbot] AI response:', result.success ? 'Success' : `Failed: ${result.error}`);

    if (result.success) {
      // Save assistant response
      await ChatModel.addMessage(userId, conversation.id!, {
        role: 'assistant',
        content: result.content.trim(),
        timestamp: new Date()
      });

      res.status(200).json({
        success: true,
        response: result.content.trim(),
        conversationId: conversation.id,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('[Chatbot] AI Error:', result.error);
      
      // Check if it's a quota error
      const isQuotaError = result.error?.includes('quota') || result.error?.includes('Quota');
      
      if (isQuotaError) {
        // Provide a helpful fallback response
        const fallbackResponse = `I'm currently experiencing high demand and my AI service quota has been exceeded. 

Here are some general PCOS tips while I recover:

• Maintain a balanced diet with low glycemic foods
• Regular exercise (30 min daily) helps manage symptoms
• Prioritize 7-8 hours of quality sleep
• Manage stress through meditation or yoga
• Stay hydrated and limit processed foods

For personalized advice, please consult your healthcare provider. I'll be back to full capacity soon!`;

        // Save fallback response
        await ChatModel.addMessage(userId, conversation.id!, {
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        });

        res.status(200).json({
          success: true,
          response: fallbackResponse,
          conversationId: conversation.id,
          timestamp: new Date().toISOString(),
          fallback: true
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error || 'Failed to generate response'
        });
      }
    }
  } catch (error) {
    console.error('[Chatbot] Exception:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}

/**
 * Get conversation history
 * GET /api/chatbot/history
 */
export async function getHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const conversations = await ChatModel.getConversationHistory(userId, 10);
    
    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}

/**
 * Get a specific conversation
 * GET /api/chatbot/conversation/:id
 */
export async function getConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const conversation = await ChatModel.getConversationById(userId, id);

    if (!conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}

/**
 * Delete a conversation
 * DELETE /api/chatbot/conversation/:id
 */
export async function deleteConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const deleted = await ChatModel.deleteConversation(userId, id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
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
export async function getSuggestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    
    // Base suggestions
    let suggestions = [
      "What are common PCOS symptoms?",
      "How can I manage PCOS naturally?",
      "What foods should I eat with PCOS?",
      "How does sleep affect PCOS?"
    ];

    // Add personalized suggestions if user is authenticated
    if (userId) {
      const healthContext = await getUserHealthContext(userId);
      
      if (healthContext.recentMoods.length > 0) {
        const avgMood = healthContext.recentMoods.reduce((s, m) => s + m.mood, 0) / healthContext.recentMoods.length;
        if (avgMood < 3) {
          suggestions.unshift("Why has my mood been low lately?");
        }
      }

      if (healthContext.recentSleep.length > 0) {
        const avgHours = healthContext.recentSleep.reduce((s, sl) => s + sl.duration, 0) / healthContext.recentSleep.length / 60;
        if (avgHours < 7) {
          suggestions.unshift("How can I improve my sleep?");
        }
      }

      if (healthContext.periodInfo.isOnPeriod) {
        suggestions.unshift("Tips for managing period symptoms?");
      }

      if (healthContext.recentSymptoms.length > 0) {
        suggestions.unshift(`How can I manage ${healthContext.recentSymptoms[0].name}?`);
      }
    }

    // Limit to 6 suggestions
    suggestions = suggestions.slice(0, 6);

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    // Return default suggestions on error
    res.status(200).json({
      success: true,
      suggestions: [
        "What are common PCOS symptoms?",
        "How can I manage PCOS naturally?",
        "What foods should I eat with PCOS?",
        "How does sleep affect PCOS?"
      ]
    });
  }
}
