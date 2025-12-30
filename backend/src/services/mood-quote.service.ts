/**
 * AI-powered Mood Quote Service
 * Generates personalized motivational quotes based on user's mood
 */

import { getAIService } from './ai.service';

export interface MoodQuote {
  quote: string;
  author: string;
  mood: number;
  generatedAt: Date;
}

const MOOD_CONTEXTS: Record<number, string> = {
  1: 'feeling terrible and needs gentle, comforting words',
  2: 'feeling down and needs uplifting encouragement',
  3: 'feeling okay and could use some motivation',
  4: 'feeling good and wants to maintain positivity',
  5: 'feeling great and wants to celebrate',
};

/**
 * Generate AI quote based on mood
 */
export async function generateMoodQuote(mood: number, factors: string[] = []): Promise<MoodQuote> {
  try {
    const aiService = getAIService();
    const context = MOOD_CONTEXTS[mood] || MOOD_CONTEXTS[3];
    const factorContext = factors.length > 0 ? `They are dealing with: ${factors.join(', ')}.` : '';

    const prompt = `You are a supportive wellness companion for women with PCOS.
Generate ONE short, heartfelt motivational quote for someone who is ${context}. ${factorContext}

The quote should be:
- Warm, feminine, and empowering
- 1-2 sentences max
- Relatable for women managing health challenges
- NOT cliché or generic

Return ONLY valid JSON:
{
  "quote": "your motivational quote here",
  "author": "quote author or 'Unknown' if original"
}`;

    interface QuoteResponse {
      quote: string;
      author: string;
    }

    const result = await aiService.generateJSON<QuoteResponse>(prompt);

    if (result.success && result.data) {
      return {
        quote: result.data.quote,
        author: result.data.author || 'Unknown',
        mood,
        generatedAt: new Date(),
      };
    }

    return getFallbackQuote(mood);
  } catch (error) {
    console.error('Error generating quote:', error);
    return getFallbackQuote(mood);
  }
}

/**
 * Fallback quotes when AI fails
 */
function getFallbackQuote(mood: number): MoodQuote {
  const fallbacks: Record<number, { quote: string; author: string }[]> = {
    1: [
      { quote: "It's okay to not be okay. Your feelings are valid, and this moment will pass.", author: "Unknown" },
      { quote: "You are stronger than you know, braver than you believe.", author: "A.A. Milne" },
    ],
    2: [
      { quote: "Every storm runs out of rain. Keep going, beautiful soul.", author: "Maya Angelou" },
      { quote: "You don't have to be perfect to be worthy of love and rest.", author: "Unknown" },
    ],
    3: [
      { quote: "Small steps still move you forward. Be proud of your progress.", author: "Unknown" },
      { quote: "You're doing better than you think you are.", author: "Unknown" },
    ],
    4: [
      { quote: "Your positive energy is contagious. Keep shining!", author: "Unknown" },
      { quote: "Happiness looks beautiful on you.", author: "Unknown" },
    ],
    5: [
      { quote: "You're glowing! Celebrate this feeling and remember it on harder days.", author: "Unknown" },
      { quote: "Your joy is your superpower. Spread it generously!", author: "Unknown" },
    ],
  };

  const quotes = fallbacks[mood] || fallbacks[3];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    ...randomQuote,
    mood,
    generatedAt: new Date(),
  };
}
