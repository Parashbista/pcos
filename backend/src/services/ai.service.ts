/**
 * AI Service - Flexible adapter for multiple AI providers
 * Switch providers by changing AI_PROVIDER and API key in .env
 */

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'groq';

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
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    // Use gemini-2.5-flash for the latest stable version (v1 API)
    this.model = model || 'gemini-2.5-flash';
    console.log(`[GeminiAdapter] Initialized with model: ${this.model}`);
  }

  private getApiVersion(): string {
    // Check which models are available in which API version
    // gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash are in v1
    // Experimental models are in v1beta
    if (this.model.includes('exp') || this.model.includes('preview')) {
      console.log(`[Gemini] Using v1beta for experimental model: ${this.model}`);
      return 'v1beta';
    }
    console.log(`[Gemini] Using v1 for stable model: ${this.model}`);
    return 'v1';
  }

  async generateContent(options: AIRequestOptions): Promise<AIResponse> {
    try {
      const apiVersion = this.getApiVersion();
      const baseUrl = `https://generativelanguage.googleapis.com/${apiVersion}`;
      
      // Remove 'models/' prefix if present in model name
      const modelName = this.model.startsWith('models/') ? this.model : `models/${this.model}`;
      const url = `${baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;
      
      console.log(`[Gemini] ========== API Request Details ==========`);
      console.log(`[Gemini] Model: ${this.model}`);
      console.log(`[Gemini] API Version: ${apiVersion}`);
      console.log(`[Gemini] Full URL: ${baseUrl}/${modelName}:generateContent`);
      console.log(`[Gemini] API Key: ${this.apiKey.substring(0, 10)}...`);
      
      // Build generation config based on API version
      const generationConfig: any = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024
      };

      // responseMimeType is only supported in v1beta
      if (apiVersion === 'v1beta' && options.responseFormat === 'json') {
        generationConfig.responseMimeType = 'application/json';
      }

      const requestBody = {
        contents: [{
          parts: [{ text: options.prompt }]
        }],
        generationConfig
      };

      console.log(`[Gemini] Request body:`, JSON.stringify(requestBody, null, 2).substring(0, 300));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log(`[Gemini] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.json();
        console.error('[Gemini] API Error Response:', JSON.stringify(error, null, 2));
        return { success: false, content: '', error: error.error?.message || 'Gemini API error' };
      }

      const data = await response.json();
      console.log(`[Gemini] Raw response data:`, JSON.stringify(data, null, 2).substring(0, 500));
      
      // Try different response structures
      let content = '';
      
      // Standard structure: candidates[0].content.parts[0].text
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        content = data.candidates[0].content.parts[0].text;
      }
      // Alternative structure: candidates[0].text
      else if (data.candidates?.[0]?.text) {
        content = data.candidates[0].text;
      }
      // Alternative structure: candidates[0].output
      else if (data.candidates?.[0]?.output) {
        content = data.candidates[0].output;
      }
      // Check if parts exist but are empty
      else if (data.candidates?.[0]?.content?.parts) {
        console.log(`[Gemini] Parts array exists but is empty or malformed:`, data.candidates[0].content.parts);
      }
      
      console.log(`[Gemini] Success! Response length: ${content.length} chars`);
      if (content) {
        console.log(`[Gemini] Response preview: "${content.substring(0, 100)}"`);
      } else {
        console.log(`[Gemini] WARNING: Empty response content`);
        console.log(`[Gemini] Full candidates structure:`, JSON.stringify(data.candidates, null, 2));
      }
      console.log(`[Gemini] ========================================`);
      
      return { success: true, content, rawResponse: data };
    } catch (error) {
      console.error('[Gemini] Exception:', error);
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
 * Groq API adapter (FREE - Fast inference with Llama models)
 */
class GroqAdapter implements AIProviderAdapter {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    // Default to llama-3.3-70b-versatile (free, fast, and capable)
    this.model = model || 'llama-3.3-70b-versatile';
    console.log(`[GroqAdapter] Initialized with model: ${this.model}`);
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

      console.log(`[Groq] Sending request to ${this.model}...`);

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
        console.error('[Groq] API Error:', error);
        return { success: false, content: '', error: error.error?.message || 'Groq API error' };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      console.log(`[Groq] Success! Response length: ${content.length} chars`);
      return { success: true, content, rawResponse: data };
    } catch (error) {
      console.error('[Groq] Exception:', error);
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
    console.log(`[AIService] Initializing with provider: ${this.provider}, model: ${process.env.AI_MODEL || 'default'}`);
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
      case 'groq':
        return new GroqAdapter(apiKey, model);
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
      case 'gemini': return 'gemini-2.5-flash';
      case 'openai': return 'gpt-3.5-turbo';
      case 'anthropic': return 'claude-3-haiku-20240307';
      case 'groq': return 'llama-3.3-70b-versatile';
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
