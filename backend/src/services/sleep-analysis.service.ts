/**
 * Sleep Analysis Service
 * Analyzes sleep patterns, generates alerts, and connects with cycle health
 */

import { getSleepEntriesCollection } from '../models/sleep.model';
import { getAIService } from './ai.service';

export interface SleepAlert {
  type: 'low_sleep' | 'irregular_pattern' | 'quality_drop' | 'cycle_impact';
  severity: 'warning' | 'alert' | 'info';
  title: string;
  message: string;
  recommendation: string;
  data?: {
    averageSleep?: number;
    targetSleep?: number;
    daysAnalyzed?: number;
  };
}

export interface WeeklyPattern {
  weekStart: string;
  weekEnd: string;
  averageDuration: number;
  averageQuality: number;
  totalEntries: number;
  consistencyScore: number;
  bestDay: { day: string; duration: number } | null;
  worstDay: { day: string; duration: number } | null;
  trend: 'improving' | 'declining' | 'stable';
}

export interface SleepAnalysis {
  weeklyPattern: WeeklyPattern;
  alerts: SleepAlert[];
  cycleImpactInsight?: string;
  aiRecommendation?: string;
}

const MINIMUM_HEALTHY_SLEEP = 6 * 60; // 6 hours in minutes
const OPTIMAL_SLEEP = 7.5 * 60; // 7.5 hours in minutes
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyze user's sleep for the past week
 */
export async function analyzeWeeklySleep(userId: string): Promise<SleepAnalysis> {
  const collection = getSleepEntriesCollection();
  
  // Get last 7 days of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const entries = await collection
    .find({
      userId,
      date: {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0],
      },
    })
    .sort({ date: -1 })
    .toArray();

  // Calculate weekly pattern
  const weeklyPattern = calculateWeeklyPattern(entries, startDate, endDate);
  
  // Generate alerts
  const alerts = generateSleepAlerts(weeklyPattern, entries);
  
  // Get AI recommendation if sleep is poor
  let aiRecommendation: string | undefined;
  let cycleImpactInsight: string | undefined;
  
  if (weeklyPattern.averageDuration < MINIMUM_HEALTHY_SLEEP) {
    const aiInsights = await generateAIInsights(weeklyPattern, entries);
    aiRecommendation = aiInsights.recommendation;
    cycleImpactInsight = aiInsights.cycleImpact;
  }

  return {
    weeklyPattern,
    alerts,
    cycleImpactInsight,
    aiRecommendation,
  };
}

/**
 * Calculate weekly sleep pattern
 */
function calculateWeeklyPattern(entries: any[], startDate: Date, endDate: Date): WeeklyPattern {
  if (entries.length === 0) {
    return {
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
      averageDuration: 0,
      averageQuality: 0,
      totalEntries: 0,
      consistencyScore: 0,
      bestDay: null,
      worstDay: null,
      trend: 'stable',
    };
  }

  const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalQuality = entries.reduce((sum, e) => sum + e.quality, 0);
  const avgDuration = totalDuration / entries.length;
  
  // Find best and worst days
  const sortedByDuration = [...entries].sort((a, b) => b.duration - a.duration);
  const bestEntry = sortedByDuration[0];
  const worstEntry = sortedByDuration[sortedByDuration.length - 1];
  
  // Calculate consistency (standard deviation)
  const variance = entries.reduce((sum, e) => sum + Math.pow(e.duration - avgDuration, 2), 0) / entries.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (stdDev / 30)); // Lower std dev = higher consistency
  
  // Determine trend (compare first half vs second half)
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(midpoint);
  const secondHalf = entries.slice(0, midpoint);
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, e) => sum + e.duration, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, e) => sum + e.duration, 0) / secondHalf.length 
    : 0;
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondHalfAvg - firstHalfAvg > 30) trend = 'improving';
  else if (firstHalfAvg - secondHalfAvg > 30) trend = 'declining';

  return {
    weekStart: startDate.toISOString().split('T')[0],
    weekEnd: endDate.toISOString().split('T')[0],
    averageDuration: Math.round(avgDuration),
    averageQuality: parseFloat((totalQuality / entries.length).toFixed(1)),
    totalEntries: entries.length,
    consistencyScore: Math.round(consistencyScore),
    bestDay: bestEntry ? {
      day: DAY_NAMES[new Date(bestEntry.date).getDay()],
      duration: bestEntry.duration,
    } : null,
    worstDay: worstEntry ? {
      day: DAY_NAMES[new Date(worstEntry.date).getDay()],
      duration: worstEntry.duration,
    } : null,
    trend,
  };
}


/**
 * Generate sleep alerts based on patterns
 */
function generateSleepAlerts(pattern: WeeklyPattern, entries: any[]): SleepAlert[] {
  const alerts: SleepAlert[] = [];
  const avgHours = pattern.averageDuration / 60;

  // Alert 1: Low average sleep (below 6 hours)
  if (pattern.averageDuration > 0 && pattern.averageDuration < MINIMUM_HEALTHY_SLEEP) {
    alerts.push({
      type: 'low_sleep',
      severity: avgHours < 5 ? 'alert' : 'warning',
      title: '💤 Sleep Alert',
      message: `Your average sleep this week is ${avgHours.toFixed(1)} hours, which is below the recommended 7-8 hours.`,
      recommendation: 'Try to maintain a consistent sleep schedule of 7-8 hours for better hormonal balance. Poor sleep can affect your menstrual cycle and PCOS symptoms.',
      data: {
        averageSleep: pattern.averageDuration,
        targetSleep: OPTIMAL_SLEEP,
        daysAnalyzed: pattern.totalEntries,
      },
    });
  }

  // Alert 2: Declining sleep trend
  if (pattern.trend === 'declining' && pattern.totalEntries >= 4) {
    alerts.push({
      type: 'irregular_pattern',
      severity: 'warning',
      title: '📉 Sleep Trend Alert',
      message: 'Your sleep duration has been declining over the past week.',
      recommendation: 'Consider establishing a relaxing bedtime routine. Avoid screens 1 hour before bed and try to go to sleep at the same time each night.',
    });
  }

  // Alert 3: Low consistency
  if (pattern.consistencyScore < 50 && pattern.totalEntries >= 4) {
    alerts.push({
      type: 'irregular_pattern',
      severity: 'info',
      title: '🔄 Inconsistent Sleep Pattern',
      message: 'Your sleep schedule varies significantly from day to day.',
      recommendation: 'Consistent sleep timing helps regulate your circadian rhythm and hormones. Try to wake up at the same time every day, even on weekends.',
    });
  }

  // Alert 4: Quality drop
  if (pattern.averageQuality > 0 && pattern.averageQuality < 3) {
    alerts.push({
      type: 'quality_drop',
      severity: 'warning',
      title: '😴 Sleep Quality Alert',
      message: 'Your sleep quality has been below average this week.',
      recommendation: 'Consider factors that might be affecting your sleep quality: stress, caffeine, screen time, or room temperature. A cool, dark room promotes better sleep.',
    });
  }

  // Alert 5: PCOS/Cycle impact (if sleep is consistently poor)
  if (pattern.averageDuration > 0 && pattern.averageDuration < MINIMUM_HEALTHY_SLEEP && pattern.totalEntries >= 5) {
    alerts.push({
      type: 'cycle_impact',
      severity: 'info',
      title: '🌸 Cycle Health Connection',
      message: 'Poor sleep can contribute to irregular periods and worsen PCOS symptoms.',
      recommendation: 'Research shows that women who sleep less than 6 hours have higher rates of menstrual irregularity. Prioritizing sleep can help balance your hormones naturally.',
    });
  }

  return alerts;
}

/**
 * Generate AI-powered insights for poor sleep
 */
async function generateAIInsights(
  pattern: WeeklyPattern,
  entries: any[]
): Promise<{ recommendation: string; cycleImpact: string }> {
  try {
    const aiService = getAIService();
    
    // Collect factors from entries
    const allFactors: string[] = [];
    entries.forEach(e => {
      if (e.factors) allFactors.push(...e.factors);
    });
    const factorCounts: Record<string, number> = {};
    allFactors.forEach(f => {
      factorCounts[f] = (factorCounts[f] || 0) + 1;
    });
    const topFactors = Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([factor]) => factor);

    const prompt = `You are a women's health expert specializing in PCOS and sleep.

User's sleep data for the past week:
- Average sleep: ${(pattern.averageDuration / 60).toFixed(1)} hours
- Average quality: ${pattern.averageQuality}/5
- Sleep trend: ${pattern.trend}
- Common factors affecting sleep: ${topFactors.join(', ') || 'none reported'}

Generate a brief, supportive response with:
1. A personalized sleep recommendation (2-3 sentences)
2. How this sleep pattern might affect their menstrual cycle/PCOS (1-2 sentences)

Return ONLY valid JSON:
{
  "recommendation": "your personalized sleep advice",
  "cycleImpact": "how poor sleep affects periods/PCOS"
}`;

    interface AIResponse {
      recommendation: string;
      cycleImpact: string;
    }

    const result = await aiService.generateJSON<AIResponse>(prompt);

    if (result.success && result.data) {
      return result.data;
    }

    return getDefaultInsights();
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return getDefaultInsights();
  }
}

function getDefaultInsights(): { recommendation: string; cycleImpact: string } {
  return {
    recommendation: 'Try to establish a consistent bedtime routine. Aim for 7-8 hours of sleep and avoid screens before bed. Creating a calm sleep environment can significantly improve your rest.',
    cycleImpact: 'Chronic sleep deprivation can disrupt hormone production, potentially leading to irregular periods and worsening PCOS symptoms. Prioritizing sleep is one of the most effective natural ways to support hormonal balance.',
  };
}

/**
 * Get sleep analysis summary for dashboard
 */
export async function getSleepSummaryForDashboard(userId: string): Promise<{
  hasAlert: boolean;
  alertMessage?: string;
  averageSleep: number;
  trend: string;
}> {
  const analysis = await analyzeWeeklySleep(userId);
  
  const criticalAlert = analysis.alerts.find(a => a.severity === 'alert' || a.type === 'low_sleep');
  
  return {
    hasAlert: analysis.alerts.length > 0,
    alertMessage: criticalAlert?.message,
    averageSleep: analysis.weeklyPattern.averageDuration,
    trend: analysis.weeklyPattern.trend,
  };
}
