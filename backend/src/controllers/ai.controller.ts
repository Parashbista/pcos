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
