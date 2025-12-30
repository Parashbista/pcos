/**
 * Supplement Analysis Service
 * Analyzes supplement consistency, generates alerts, and provides AI recommendations
 */

import {
  getSupplements,
  getSupplementLogs,
  getDietLogs,
} from '../models/supplement.model';
import {
  Supplement,
  SupplementLog,
  SupplementConsistency,
  SupplementAlert,
  SupplementAnalysis,
  SUPPLEMENT_INFO,
  SupplementName,
} from '../models/supplement.types';
import { getAIService } from './ai.service';

const CONSISTENCY_THRESHOLD = 70; // Below this triggers alert
const DAYS_TO_ANALYZE = 14; // 2 weeks

/**
 * Analyze supplement consistency for a user
 */
export async function analyzeSupplementConsistency(
  userId: string
): Promise<SupplementAnalysis> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - DAYS_TO_ANALYZE);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Get user's supplements and logs
  const supplements = await getSupplements(userId, true);
  const logs = await getSupplementLogs(userId, startDateStr, endDateStr);
  const dietLogs = await getDietLogs(userId, startDateStr, endDateStr);

  if (supplements.length === 0) {
    return {
      period: { start: startDateStr, end: endDateStr },
      overallConsistency: 0,
      supplements: [],
      alerts: [{
        type: 'info' as any,
        severity: 'info',
        title: '📋 No Supplements Tracked',
        message: 'You haven\'t added any supplements yet.',
        recommendation: 'Add your PCOS supplements to track consistency and get personalized tips.',
      }],
    };
  }

  // Calculate consistency for each supplement
  const supplementConsistencies: SupplementConsistency[] = [];
  const alerts: SupplementAlert[] = [];

  for (const supplement of supplements) {
    const supplementLogs = logs.filter(l => l.supplementId === supplement.id);
    const consistency = calculateConsistency(supplement, supplementLogs, DAYS_TO_ANALYZE);
    supplementConsistencies.push(consistency);

    // Generate alerts for this supplement
    const supplementAlerts = generateSupplementAlerts(supplement, consistency, supplementLogs);
    alerts.push(...supplementAlerts);
  }

  // Calculate overall consistency
  const overallConsistency = supplementConsistencies.length > 0
    ? Math.round(
        supplementConsistencies.reduce((sum, s) => sum + s.consistencyRate, 0) /
        supplementConsistencies.length
      )
    : 0;

  // Check diet logs for poor nutrition patterns
  const dietAlerts = analyzeDietPatterns(dietLogs);
  alerts.push(...dietAlerts);

  // Get AI recommendations if consistency is low
  let aiRecommendation: string | undefined;
  let cycleImpactInsight: string | undefined;

  if (overallConsistency < CONSISTENCY_THRESHOLD || alerts.length > 0) {
    const aiInsights = await generateAIInsights(
      supplements,
      supplementConsistencies,
      dietLogs,
      overallConsistency
    );
    aiRecommendation = aiInsights.recommendation;
    cycleImpactInsight = aiInsights.cycleImpact;
  }

  return {
    period: { start: startDateStr, end: endDateStr },
    overallConsistency,
    supplements: supplementConsistencies,
    alerts,
    cycleImpactInsight,
    aiRecommendation,
  };
}

/**
 * Calculate consistency for a single supplement
 */
function calculateConsistency(
  supplement: Supplement,
  logs: SupplementLog[],
  days: number
): SupplementConsistency {
  // Calculate expected doses based on frequency
  let expectedDoses = days;
  if (supplement.frequency === 'twice_daily') expectedDoses = days * 2;
  else if (supplement.frequency === 'weekly') expectedDoses = Math.ceil(days / 7);

  const takenLogs = logs.filter(l => l.taken);
  const takenDays = takenLogs.length;
  const missedDays = Math.max(0, expectedDoses - takenDays);
  const consistencyRate = expectedDoses > 0 
    ? Math.round((takenDays / expectedDoses) * 100) 
    : 0;

  // Calculate streak
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  for (const log of sortedLogs) {
    if (log.taken) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  streak = currentStreak;

  const displayName = supplement.name === 'custom' 
    ? supplement.customName || 'Custom Supplement'
    : SUPPLEMENT_INFO[supplement.name as SupplementName]?.label || supplement.name;

  return {
    supplementId: supplement.id,
    supplementName: displayName,
    totalDays: days,
    takenDays,
    missedDays,
    consistencyRate,
    streak,
    longestStreak,
  };
}

/**
 * Generate alerts for a supplement
 */
function generateSupplementAlerts(
  supplement: Supplement,
  consistency: SupplementConsistency,
  logs: SupplementLog[]
): SupplementAlert[] {
  const alerts: SupplementAlert[] = [];
  const info = SUPPLEMENT_INFO[supplement.name as SupplementName];
  const displayName = consistency.supplementName;

  // Low consistency alert
  if (consistency.consistencyRate < CONSISTENCY_THRESHOLD && consistency.totalDays >= 7) {
    alerts.push({
      type: 'low_consistency',
      severity: consistency.consistencyRate < 50 ? 'alert' : 'warning',
      title: `📉 Low ${displayName} Consistency`,
      message: `You've only taken ${displayName} ${consistency.consistencyRate}% of the time in the past 2 weeks.`,
      recommendation: info?.pcosRelation 
        ? `${displayName} ${info.pcosRelation.toLowerCase()}. Try setting a daily reminder to improve consistency.`
        : 'Consistent supplementation is key for seeing benefits. Try linking it to an existing habit.',
      supplementName: displayName,
    });
  }

  // Absorption tip if not taken correctly
  if (info && supplement.instruction !== info.bestTaken) {
    const recentLogs = logs.slice(0, 7);
    const takenWithFoodCount = recentLogs.filter(l => l.takenWithFood).length;
    const takenCount = recentLogs.filter(l => l.taken).length;

    if (info.bestTaken === 'with_food' && takenCount > 0 && takenWithFoodCount < takenCount * 0.5) {
      alerts.push({
        type: 'absorption_tip',
        severity: 'info',
        title: `💡 ${displayName} Absorption Tip`,
        message: `You're often taking ${displayName} without food.`,
        recommendation: info.absorptionTip,
        supplementName: displayName,
      });
    }

    if (info.bestTaken === 'with_fat' && takenCount > 0 && takenWithFoodCount < takenCount * 0.7) {
      alerts.push({
        type: 'absorption_tip',
        severity: 'info',
        title: `💡 ${displayName} Absorption Tip`,
        message: `${displayName} absorbs better with fatty foods.`,
        recommendation: info.absorptionTip,
        supplementName: displayName,
      });
    }
  }

  // Missed dose alert (if missed yesterday)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayLog = logs.find(l => l.date === yesterdayStr);

  if (!yesterdayLog || !yesterdayLog.taken) {
    alerts.push({
      type: 'missed_dose',
      severity: 'info',
      title: `⏰ Missed ${displayName} Yesterday`,
      message: `Don't forget to take your ${displayName} today!`,
      recommendation: 'Consistency is more important than perfection. Just continue with your regular schedule.',
      supplementName: displayName,
    });
  }

  return alerts;
}

/**
 * Analyze diet patterns for alerts
 */
function analyzeDietPatterns(dietLogs: any[]): SupplementAlert[] {
  const alerts: SupplementAlert[] = [];

  if (dietLogs.length === 0) return alerts;

  const unhealthyCount = dietLogs.filter(l => !l.isHealthy).length;
  const unhealthyRate = (unhealthyCount / dietLogs.length) * 100;

  if (unhealthyRate > 50 && dietLogs.length >= 7) {
    alerts.push({
      type: 'cycle_impact',
      severity: 'warning',
      title: '🍽️ Nutrition Alert',
      message: `${Math.round(unhealthyRate)}% of your recent meals were marked as unhealthy.`,
      recommendation: 'Poor nutrition can worsen PCOS symptoms and affect your cycle. Focus on whole foods, lean proteins, and vegetables.',
    });
  }

  // Check for processed food tags
  const processedCount = dietLogs.filter(l => 
    l.tags?.includes('processed') || l.tags?.includes('fast_food')
  ).length;

  if (processedCount > dietLogs.length * 0.3) {
    alerts.push({
      type: 'cycle_impact',
      severity: 'info',
      title: '🚫 Processed Food Alert',
      message: 'You\'ve been eating a lot of processed foods recently.',
      recommendation: 'Processed foods can spike insulin and worsen PCOS. Try meal prepping to have healthy options ready.',
    });
  }

  return alerts;
}

/**
 * Generate AI-powered insights
 */
async function generateAIInsights(
  supplements: Supplement[],
  consistencies: SupplementConsistency[],
  dietLogs: any[],
  overallConsistency: number
): Promise<{ recommendation: string; cycleImpact: string }> {
  try {
    const aiService = getAIService();

    const supplementList = consistencies.map(c => 
      `- ${c.supplementName}: ${c.consistencyRate}% consistency (${c.takenDays}/${c.totalDays} days)`
    ).join('\n');

    const unhealthyMeals = dietLogs.filter(l => !l.isHealthy).length;
    const totalMeals = dietLogs.length;

    const prompt = `You are a PCOS nutrition and supplement expert.

User's supplement data (past 2 weeks):
${supplementList}
Overall consistency: ${overallConsistency}%

Diet data:
- Total meals logged: ${totalMeals}
- Unhealthy meals: ${unhealthyMeals} (${totalMeals > 0 ? Math.round((unhealthyMeals/totalMeals)*100) : 0}%)

Based on this data, provide:
1. A personalized recommendation to improve supplement consistency and nutrition (2-3 sentences)
2. How their current supplement/diet patterns might affect their menstrual cycle and PCOS (2 sentences)

Return ONLY valid JSON:
{
  "recommendation": "your personalized advice",
  "cycleImpact": "how this affects their cycle/PCOS"
}`;

    interface AIResponse {
      recommendation: string;
      cycleImpact: string;
    }

    const result = await aiService.generateJSON<AIResponse>(prompt);

    if (result.success && result.data) {
      return result.data;
    }

    return getDefaultInsights(overallConsistency);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return getDefaultInsights(overallConsistency);
  }
}

function getDefaultInsights(consistency: number): { recommendation: string; cycleImpact: string } {
  if (consistency >= 70) {
    return {
      recommendation: 'Great job maintaining your supplement routine! Keep up the consistency. Consider tracking your meals to optimize your PCOS management further.',
      cycleImpact: 'Consistent supplementation supports hormone balance and may help regulate your cycle over time. Continue your current routine for best results.',
    };
  }

  return {
    recommendation: 'Try setting daily reminders for your supplements. Link taking them to existing habits like breakfast or brushing teeth. Start with one supplement and build from there.',
    cycleImpact: 'Inconsistent supplementation may reduce their effectiveness for managing PCOS symptoms. Regular intake of key supplements like inositol and vitamin D can help support ovulation and hormone balance.',
  };
}

/**
 * Get quick absorption tip for a supplement
 */
export function getAbsorptionTip(supplementName: SupplementName): string {
  const info = SUPPLEMENT_INFO[supplementName];
  return info?.absorptionTip || 'Follow the instructions on the supplement label.';
}

/**
 * Get today's supplement status
 */
export async function getTodaySupplementStatus(userId: string): Promise<{
  total: number;
  taken: number;
  pending: number;
  supplements: { name: string; taken: boolean; time: string }[];
}> {
  const today = new Date().toISOString().split('T')[0];
  const supplements = await getSupplements(userId, true);
  const logs = await getSupplementLogs(userId, today, today);

  const status = supplements.map(s => {
    const log = logs.find(l => l.supplementId === s.id);
    const displayName = s.name === 'custom'
      ? s.customName || 'Custom'
      : SUPPLEMENT_INFO[s.name as SupplementName]?.label || s.name;

    return {
      name: displayName,
      taken: log?.taken || false,
      time: s.timeOfDay[0] || '08:00',
    };
  });

  const taken = status.filter(s => s.taken).length;

  return {
    total: supplements.length,
    taken,
    pending: supplements.length - taken,
    supplements: status,
  };
}
