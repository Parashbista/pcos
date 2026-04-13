import { getDb } from '../config/database';

interface HealthContext {
  recentMoods: { date: string; mood: number; factors: string[] }[];
  recentSleep: { date: string; duration: number; quality: number }[];
  periodInfo: { lastPeriod: string | null; cycleLength: number | null; isOnPeriod: boolean };
  recentSymptoms: { name: string; count: number }[];
}

/**
 * Fetch user's recent health data to personalize chatbot responses
 */
export async function getUserHealthContext(userId: string): Promise<HealthContext> {
  const db = getDb();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  // Get recent mood entries
  const moodEntries = await db.collection('mood_entries')
    .find({ userId, date: { $gte: weekAgoStr } })
    .sort({ date: -1 })
    .limit(7)
    .toArray();

  const recentMoods = moodEntries.map((m: any) => ({
    date: m.date,
    mood: m.mood,
    factors: m.factors || []
  }));

  // Get recent sleep entries
  const sleepEntries = await db.collection('sleep_entries')
    .find({ userId, date: { $gte: weekAgoStr } })
    .sort({ date: -1 })
    .limit(7)
    .toArray();

  const recentSleep = sleepEntries.map((s: any) => ({
    date: s.date,
    duration: s.duration,
    quality: s.quality
  }));

  // Get period info
  const lastPeriod = await db.collection('period_entries')
    .findOne({ userId }, { sort: { startDate: -1 } });

  let isOnPeriod = false;
  if (lastPeriod && !lastPeriod.endDate) {
    isOnPeriod = true;
  }

  const periodInfo = {
    lastPeriod: lastPeriod?.startDate || null,
    cycleLength: lastPeriod?.cycleLength || null,
    isOnPeriod
  };

  // Get recent symptoms (aggregate counts)
  const symptomEntries = await db.collection('symptom_entries')
    .find({ userId, date: { $gte: weekAgoStr } })
    .toArray();

  const symptomCounts: Record<string, number> = {};
  symptomEntries.forEach((entry: any) => {
    (entry.symptoms || []).forEach((symptom: string) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  const recentSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { recentMoods, recentSleep, periodInfo, recentSymptoms };
}

/**
 * Build personalized context string for AI prompt
 */
export function buildHealthContextPrompt(context: HealthContext): string {
  const parts: string[] = [];

  // Mood context
  if (context.recentMoods.length > 0) {
    const avgMood = context.recentMoods.reduce((sum, m) => sum + m.mood, 0) / context.recentMoods.length;
    const moodLabel = avgMood >= 4 ? 'good' : avgMood >= 3 ? 'okay' : 'low';
    const factors = [...new Set(context.recentMoods.flatMap(m => m.factors))].slice(0, 3);
    parts.push(`• Mood this week: ${moodLabel} (avg ${avgMood.toFixed(1)}/5)${factors.length ? `, factors: ${factors.join(', ')}` : ''}`);
  }

  // Sleep context
  if (context.recentSleep.length > 0) {
    const avgHours = context.recentSleep.reduce((sum, s) => sum + s.duration, 0) / context.recentSleep.length / 60;
    const avgQuality = context.recentSleep.reduce((sum, s) => sum + s.quality, 0) / context.recentSleep.length;
    parts.push(`• Sleep this week: ${avgHours.toFixed(1)} hrs avg, quality ${avgQuality.toFixed(1)}/5`);
  }

  // Period context
  if (context.periodInfo.lastPeriod) {
    if (context.periodInfo.isOnPeriod) {
      parts.push(`• Currently on period`);
    } else {
      const daysSince = Math.floor((Date.now() - new Date(context.periodInfo.lastPeriod).getTime()) / (1000 * 60 * 60 * 24));
      parts.push(`• Last period: ${daysSince} days ago`);
    }
  }

  // Symptoms context
  if (context.recentSymptoms.length > 0) {
    const topSymptoms = context.recentSymptoms.map(s => s.name).join(', ');
    parts.push(`• Recent symptoms: ${topSymptoms}`);
  }

  if (parts.length === 0) {
    return '';
  }

  return `\nUSER'S RECENT HEALTH DATA (use this to personalize your response):\n${parts.join('\n')}\n`;
}
