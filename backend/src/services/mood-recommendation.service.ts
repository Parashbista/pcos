/**
 * AI-powered Mood Recommendation Service
 */

import { getAIService } from './ai.service';
import { getUserFeedbackHistory } from '../models/feedback.model';
import { FeedbackHistory, RecommendationType } from '../models/feedback.types';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  duration?: string;
  steps?: string[];
}

export interface MoodRecommendationResponse {
  mood: number;
  moodLabel: string;
  message: string;
  recommendations: Recommendation[];
  aiGenerated: boolean;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const MOOD_CONTEXT: Record<number, string> = {
  1: 'User is feeling terrible, needs gentle support and calming activities',
  2: 'User is feeling down, needs uplifting but not overwhelming suggestions',
  3: 'User is neutral, can handle moderate activities to boost energy',
  4: 'User is feeling good, can maintain or enhance current state',
  5: 'User is feeling great, can take on challenges and celebrate',
};

/**
 * Get mood label from number
 */
export function getMoodLabel(mood: number): string {
  return MOOD_LABELS[mood] || 'Unknown';
}

/**
 * Get current time of day
 */
export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Build AI prompt with user context and feedback history
 */
function buildAIPrompt(
  mood: number,
  factors: string[],
  feedbackHistory: FeedbackHistory
): string {
  const moodLabel = getMoodLabel(mood);
  const timeOfDay = getTimeOfDay();
  const moodContext = MOOD_CONTEXT[mood] || '';

  // Build feedback context
  let feedbackContext = '';
  if (feedbackHistory.good.length > 0) {
    const likedTitles = feedbackHistory.good.slice(0, 10).map(f => f.recommendationTitle);
    feedbackContext += `\nLiked recommendations: ${likedTitles.join(', ')}`;
  }
  if (feedbackHistory.bad.length > 0) {
    const dislikedTitles = feedbackHistory.bad.slice(0, 10).map(f => f.recommendationTitle);
    feedbackContext += `\nDisliked recommendations: ${dislikedTitles.join(', ')}`;
  }
  if (feedbackHistory.improve.length > 0) {
    const improvements = feedbackHistory.improve.slice(0, 5)
      .filter(f => f.comment)
      .map(f => `${f.recommendationTitle}: "${f.comment}"`);
    if (improvements.length > 0) {
      feedbackContext += `\nImprovement suggestions: ${improvements.join('; ')}`;
    }
  }

  return `You are a wellness assistant for a PCOS health app.

User's current mood: ${mood}/5 (${moodLabel})
Context: ${moodContext}
Contributing factors: ${factors.length > 0 ? factors.join(', ') : 'none specified'}
Time of day: ${timeOfDay}
${feedbackContext ? `\nUSER PREFERENCE HISTORY (learn from this):${feedbackContext}` : ''}

Generate 3-4 personalized wellness recommendations. Include a mix of:
- Breathing/relaxation exercises
- Physical activities (gentle if mood is low)
- Mental wellness activities
- Positive affirmations

${feedbackContext ? 'Based on user preferences, prioritize types similar to liked recommendations and avoid disliked ones.' : ''}

Return ONLY valid JSON in this exact format:
{
  "message": "empathetic message for user based on their mood",
  "recommendations": [
    {
      "type": "breathing",
      "title": "short title",
      "description": "brief helpful description",
      "duration": "X minutes",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ]
}

Types must be one of: breathing, exercise, activity, affirmation`;
}

/**
 * Fallback recommendations when AI fails
 */
function getFallbackRecommendations(mood: number): MoodRecommendationResponse {
  const moodLabel = getMoodLabel(mood);
  
  const fallbacks: Record<number, Recommendation[]> = {
    1: [
      { type: 'breathing', title: 'Deep Breathing', description: 'Take slow, deep breaths to calm your nervous system', duration: '3 minutes', steps: ['Breathe in for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Repeat 5 times'] },
      { type: 'affirmation', title: 'Self-Compassion', description: 'This feeling is temporary. You are doing your best.' },
    ],
    2: [
      { type: 'breathing', title: '4-7-8 Breathing', description: 'A calming technique to reduce anxiety', duration: '3 minutes', steps: ['Inhale for 4 seconds', 'Hold for 7 seconds', 'Exhale for 8 seconds', 'Repeat 4 times'] },
      { type: 'activity', title: 'Gentle Journaling', description: 'Write down 3 things, no matter how small, that went okay today' },
    ],
    3: [
      { type: 'exercise', title: 'Light Stretching', description: 'Gentle stretches to boost energy and circulation', duration: '5 minutes' },
      { type: 'activity', title: 'Gratitude Moment', description: 'Think of one thing you appreciate right now' },
    ],
    4: [
      { type: 'exercise', title: 'Energizing Walk', description: 'A brisk walk to maintain your positive energy', duration: '10 minutes' },
      { type: 'affirmation', title: 'Positive Momentum', description: 'You are on the right track. Keep going!' },
    ],
    5: [
      { type: 'exercise', title: 'Celebrate Movement', description: 'Dance or do your favorite workout to celebrate feeling great!', duration: '15 minutes' },
      { type: 'activity', title: 'Share Positivity', description: 'Reach out to someone and share your good energy' },
    ],
  };

  const messages: Record<number, string> = {
    1: "I'm here for you. Let's take this moment by moment.",
    2: "It's okay to have tough days. Here are some gentle suggestions.",
    3: "You're doing alright. Let's add a little boost to your day.",
    4: "Great to see you feeling good! Let's keep that energy going.",
    5: "Amazing! You're feeling great. Let's make the most of it!",
  };

  return {
    mood,
    moodLabel,
    message: messages[mood] || "Here are some suggestions for you.",
    recommendations: fallbacks[mood] || fallbacks[3],
    aiGenerated: false,
  };
}

/**
 * Get AI-powered recommendations based on mood
 */
export async function getRecommendations(
  userId: string,
  mood: number,
  factors: string[] = []
): Promise<MoodRecommendationResponse> {
  try {
    const aiService = getAIService();
    const feedbackHistory = await getUserFeedbackHistory(userId);
    const prompt = buildAIPrompt(mood, factors, feedbackHistory);

    interface AIRecommendationResponse {
      message: string;
      recommendations: Recommendation[];
    }

    const result = await aiService.generateJSON<AIRecommendationResponse>(prompt);

    if (result.success && result.data) {
      return {
        mood,
        moodLabel: getMoodLabel(mood),
        message: result.data.message,
        recommendations: result.data.recommendations,
        aiGenerated: true,
      };
    }

    console.warn('AI generation failed, using fallback:', result.error);
    return getFallbackRecommendations(mood);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return getFallbackRecommendations(mood);
  }
}
