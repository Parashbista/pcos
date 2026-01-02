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
  error?: string;
  timestamp?: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: string[];
}

/**
 * Send a message to the PCOS health assistant
 */
export async function sendMessage(
  message: string,
  conversationHistory: ChatMessage[]
): Promise<ChatResponse> {
  try {
    const history = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await api.post<ChatResponse>('/api/chatbot/chat', {
      message,
      conversationHistory: history
    });

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
 * Get suggested questions
 */
export async function getSuggestions(): Promise<string[]> {
  try {
    // Log the full URL being called
    const baseUrl = api.defaults.baseURL;
    const endpoint = '/api/chatbot/suggestions';
    console.log('🔍 Chatbot Service - Fetching suggestions');
    console.log('🔍 Base URL:', baseUrl);
    console.log('🔍 Full URL:', `${baseUrl}${endpoint}`);
    
    const response = await api.get<SuggestionsResponse>(endpoint);
    console.log('✅ Suggestions response:', response.data);
    return response.data.suggestions || [];
  } catch (error: any) {
    console.error('❌ Failed to get suggestions');
    console.error('❌ Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    });
    // Return fallback suggestions on error
    return [
      "What are common PCOS symptoms?",
      "How can I manage PCOS naturally?",
      "What foods should I eat with PCOS?",
      "How does sleep affect PCOS?"
    ];
  }
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
