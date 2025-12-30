/**
 * AI Service - Flexible adapter for multiple AI providers
 * Switch providers by changing AI_PROVIDER and API key in .env
 */

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIResponse {
  success: boolean;
  content: string;
  rawResponse?: unknown;
  error?: string;
}

export interface AIRequestOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'json' | 'text';
}

/**
 * Base interface for AI providers
 */
interface AIProviderAdapter {
  generateContent(options: AIRequestOptions): Promise<AIResponse>;
}

/**
 * Gemini API adapter
 */
class GeminiAdapter implements AIProviderAdapter {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gemini-2.0-flash';
  }

  async generateContent(options: AIRequestOptions): Promise<AIResponse> {
    try {
      const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
      
      const requestBody = {
        contents: [{
          parts: [{ text: options.prompt }]
        }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 1024,
          responseMimeType: options.responseFormat === 'json' ? 'application/json' : 'text/plain'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, content: '', error: error.error?.message || 'Gemini API error' };
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return { success: true, content, rawResponse: data };
    } catch (error) {
      return { success: false, content: '', error: (error as Error).message };
    }
  }
}


/**
 * OpenAI API adapter
 */
class OpenAIAdapter implements AIProviderAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'gpt-3.5-turbo';
  }

  async generateContent(options: AIRequestOptions): Promise<AIResponse> {
    try {
      const requestBody: Record<string, unknown> = {
        model: this.model,
        messages: [{ role: 'user', content: options.prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024
      };

      if (options.responseFormat === 'json') {
        requestBody.response_format = { type: 'json_object' };
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, content: '', error: error.error?.message || 'OpenAI API error' };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      return { success: true, content, rawResponse: data };
    } catch (error) {
      return { success: false, content: '', error: (error as Error).message };
    }
  }
}

/**
 * Anthropic (Claude) API adapter
 */
class AnthropicAdapter implements AIProviderAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || 'claude-3-haiku-20240307';
  }

  async generateContent(options: AIRequestOptions): Promise<AIResponse> {
    try {
      const requestBody = {
        model: this.model,
        max_tokens: options.maxTokens ?? 1024,
        messages: [{ role: 'user', content: options.prompt }]
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, content: '', error: error.error?.message || 'Anthropic API error' };
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      
      return { success: true, content, rawResponse: data };
    } catch (error) {
      return { success: false, content: '', error: (error as Error).message };
    }
  }
}

/**
 * AI Service factory - creates the appropriate adapter based on env config
 */
class AIService {
  private adapter: AIProviderAdapter;
  private provider: AIProvider;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';
    this.adapter = this.createAdapter();
  }

  private createAdapter(): AIProviderAdapter {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;

    if (!apiKey) {
      throw new Error('AI_API_KEY is not configured in environment variables');
    }

    switch (this.provider) {
      case 'gemini':
        return new GeminiAdapter(apiKey, model);
      case 'openai':
        return new OpenAIAdapter(apiKey, model);
      case 'anthropic':
        return new AnthropicAdapter(apiKey, model);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Generate content using the configured AI provider
   */
  async generate(options: AIRequestOptions): Promise<AIResponse> {
    return this.adapter.generateContent(options);
  }

  /**
   * Generate JSON response - convenience method
   */
  async generateJSON<T>(prompt: string): Promise<{ success: boolean; data?: T; error?: string }> {
    const response = await this.generate({ prompt, responseFormat: 'json' });
    
    if (!response.success) {
      return { success: false, error: response.error };
    }

    try {
      const data = JSON.parse(response.content) as T;
      return { success: true, data };
    } catch {
      return { success: false, error: 'Failed to parse JSON response' };
    }
  }

  /**
   * Get current provider info
   */
  getProviderInfo(): { provider: AIProvider; model: string } {
    return {
      provider: this.provider,
      model: process.env.AI_MODEL || this.getDefaultModel()
    };
  }

  private getDefaultModel(): string {
    switch (this.provider) {
      case 'gemini': return 'gemini-2.0-flash';
      case 'openai': return 'gpt-3.5-turbo';
      case 'anthropic': return 'claude-3-haiku-20240307';
      default: return 'unknown';
    }
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

/**
 * Get AI service instance (lazy initialization)
 */
export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

/**
 * Reset AI service (useful for testing or config changes)
 */
export function resetAIService(): void {
  aiServiceInstance = null;
}
