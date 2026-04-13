import api from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  conversationId?: string;
  error?: string;
  timestamp?: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: string[];
}

export interface ConversationSummary {
  id: string;
  messages: { role: string; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  conversations: ConversationSummary[];
}

// Store current conversation ID
let currentConversationId: string | null = null;

/**
 * Send a message to the PCOS health assistant
 */
export async function sendMessage(
  message: string,
  _conversationHistory: ChatMessage[] // kept for compatibility
): Promise<ChatResponse> {
  try {
    const response = await api.post<ChatResponse>('/api/chatbot/chat', {
      message,
      conversationId: currentConversationId
    });

    // Store conversation ID for future messages
    if (response.data.conversationId) {
      currentConversationId = response.data.conversationId;
    }

    return response.data;
  } catch (error: any) {
    console.error('Chatbot service error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send message'
    };
  }
}

/**
 * Get suggested questions (personalized based on user's health data)
 */
export async function getSuggestions(): Promise<string[]> {
  try {
    const response = await api.get<SuggestionsResponse>('/api/chatbot/suggestions');
    return response.data.suggestions || [];
  } catch (error: any) {
    console.error('Failed to get suggestions:', error);
    return [
      "What are common PCOS symptoms?",
      "How can I manage PCOS naturally?",
      "What foods should I eat with PCOS?",
      "How does sleep affect PCOS?"
    ];
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(): Promise<ConversationSummary[]> {
  try {
    const response = await api.get<HistoryResponse>('/api/chatbot/history');
    return response.data.conversations || [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
}

/**
 * Load a specific conversation
 */
export async function loadConversation(conversationId: string): Promise<ConversationSummary | null> {
  try {
    const response = await api.get<{ success: boolean; conversation: ConversationSummary }>(
      `/api/chatbot/conversation/${conversationId}`
    );
    if (response.data.success) {
      currentConversationId = conversationId;
      return response.data.conversation;
    }
    return null;
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return null;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    await api.delete(`/api/chatbot/conversation/${conversationId}`);
    if (currentConversationId === conversationId) {
      currentConversationId = null;
    }
    return true;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return false;
  }
}

/**
 * Start a new conversation
 */
export function startNewConversation(): void {
  currentConversationId = null;
}

/**
 * Get current conversation ID
 */
export function getCurrentConversationId(): string | null {
  return currentConversationId;
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
