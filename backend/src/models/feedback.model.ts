import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { RecommendationFeedback, CreateFeedbackData, FeedbackStats, FeedbackHistory } from './feedback.types';

/**
 * Get feedback collection
 */
export function getFeedbackCollection(): Collection {
  return getDb().collection('recommendation_feedback');
}

/**
 * Initialize feedback collection with indexes
 */
export async function initializeFeedbackCollections(): Promise<void> {
  const collection = getFeedbackCollection();

  await collection.createIndex({ userId: 1, createdAt: -1 });
  await collection.createIndex({ userId: 1, feedback: 1 });
  await collection.createIndex({ userId: 1, recommendationType: 1 });

  console.log('✓ Feedback collection indexes created');
}

/**
 * Create a new feedback entry
 */
export async function createFeedback(
  userId: string,
  data: CreateFeedbackData
): Promise<RecommendationFeedback> {
  const collection = getFeedbackCollection();
  const now = new Date();

  const feedback = {
    userId,
    moodLevel: data.moodLevel,
    recommendationTitle: data.recommendationTitle,
    recommendationType: data.recommendationType,
    feedback: data.feedback,
    comment: data.comment || null,
    moodFactors: data.moodFactors || [],
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(feedback);

  return {
    id: result.insertedId.toString(),
    ...feedback,
  } as RecommendationFeedback;
}

/**
 * Get user's feedback history (last 50 entries grouped by type)
 */
export async function getUserFeedbackHistory(userId: string): Promise<FeedbackHistory> {
  const collection = getFeedbackCollection();

  const feedbacks = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const history: FeedbackHistory = {
    good: [],
    bad: [],
    improve: [],
  };

  feedbacks.forEach((fb) => {
    const feedback: RecommendationFeedback = {
      id: fb._id.toString(),
      userId: fb.userId,
      moodLevel: fb.moodLevel,
      recommendationTitle: fb.recommendationTitle,
      recommendationType: fb.recommendationType,
      feedback: fb.feedback,
      comment: fb.comment,
      moodFactors: fb.moodFactors,
      createdAt: fb.createdAt,
      updatedAt: fb.updatedAt,
    };

    if (fb.feedback === 'good') history.good.push(feedback);
    else if (fb.feedback === 'bad') history.bad.push(feedback);
    else if (fb.feedback === 'improve') history.improve.push(feedback);
  });

  return history;
}

/**
 * Get user's feedback statistics
 */
export async function getUserFeedbackStats(userId: string): Promise<FeedbackStats> {
  const collection = getFeedbackCollection();

  const feedbacks = await collection.find({ userId }).toArray();

  const stats: FeedbackStats = {
    totalFeedback: feedbacks.length,
    breakdown: { good: 0, bad: 0, improve: 0 },
    byType: {
      breathing: { good: 0, bad: 0, improve: 0 },
      exercise: { good: 0, bad: 0, improve: 0 },
      activity: { good: 0, bad: 0, improve: 0 },
      affirmation: { good: 0, bad: 0, improve: 0 },
    },
    topPreferences: [],
  };

  feedbacks.forEach((fb) => {
    stats.breakdown[fb.feedback as keyof typeof stats.breakdown]++;
    if (stats.byType[fb.recommendationType as keyof typeof stats.byType]) {
      stats.byType[fb.recommendationType as keyof typeof stats.byType][fb.feedback as 'good' | 'bad' | 'improve']++;
    }
  });

  // Calculate top preferences based on good feedback ratio
  const typeScores = Object.entries(stats.byType).map(([type, counts]) => ({
    type: type as keyof typeof stats.byType,
    score: counts.good - counts.bad,
  }));

  stats.topPreferences = typeScores
    .sort((a, b) => b.score - a.score)
    .filter((t) => t.score > 0)
    .map((t) => t.type);

  return stats;
}
