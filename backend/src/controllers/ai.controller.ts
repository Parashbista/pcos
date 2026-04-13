import { Request, Response } from 'express';
import { getAIService } from '../services/ai.service';

/**
 * Test AI service connection
 * GET /api/ai/test
 */
export async function testAIService(_req: Request, res: Response): Promise<void> {
  try {
    const aiService = getAIService();
    const providerInfo = aiService.getProviderInfo();

    // Simple test prompt
    const result = await aiService.generate({
      prompt: 'Respond with exactly: "AI service is working!" Nothing else.',
      maxTokens: 50,
      temperature: 0.1
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'AI service is connected and working',
        provider: providerInfo.provider,
        model: providerInfo.model,
        testResponse: result.content.trim()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'AI service connection failed',
        provider: providerInfo.provider,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI service error',
      error: (error as Error).message
    });
  }
}

/**
 * Test JSON response from AI
 * GET /api/ai/test-json
 */
export async function testAIJSON(_req: Request, res: Response): Promise<void> {
  try {
    const aiService = getAIService();

    const result = await aiService.generateJSON<{ status: string; number: number }>(`
      Return a JSON object with exactly these fields:
      - "status": "ok"
      - "number": any random number between 1 and 100
      Return only valid JSON, no other text.
    `);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'JSON generation working',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'JSON generation failed',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}


/**
 * List available Gemini models
 * GET /api/ai/list-models
 */
export async function listModels(_req: Request, res: Response): Promise<void> {
  try {
    const apiKey = process.env.AI_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ success: false, error: 'API key not configured' });
      return;
    }

    // Try both API versions
    const versions = ['v1', 'v1beta'];
    const results: any = {};

    for (const version of versions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.models) {
          results[version] = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({
              name: m.name,
              displayName: m.displayName,
              description: m.description
            }));
        } else {
          results[version] = { error: data.error?.message || 'Failed to fetch' };
        }
      } catch (error) {
        results[version] = { error: (error as Error).message };
      }
    }

    res.status(200).json({
      success: true,
      apiKey: `${apiKey.substring(0, 10)}...`,
      availableModels: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}
