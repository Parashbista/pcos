/**
 * Cycle Irregularity Analysis Service
 * Analyzes period patterns, detects PCOS-related irregularities, and provides AI recommendations
 */

import { getPeriodEntriesCollection } from '../models/period.model';
import { getSupplementLogs } from '../models/supplement.model';
import { getSleepEntriesCollection } from '../models/sleep.model';
import { getAIService } from './ai.service';

// Constants for irregularity detection
const MIN_CYCLE_LENGTH = 21; // Days - below this is too short
const MAX_CYCLE_LENGTH = 35; // Days - above this is too long
const SEVERE_SHORT_CYCLE = 18; // Days - severely short
const SEVERE_LONG_CYCLE = 45; // Days - severely long (common in PCOS)
const MIN_PERIODS_FOR_ANALYSIS = 2; // Need at least 2 periods to analyze
const PCOS_PATTERN_THRESHOLD = 2; // Number of irregular cycles to suggest PCOS pattern

export interface CycleData {
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodLength?: number;
}

export interface IrregularityAlert {
  type: 'short_cycle' | 'long_cycle' | 'missed_period' | 'pcos_pattern' | 'improving' | 'lifestyle_impact';
  severity: 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  recommendation: string;
  data?: {
    cycleLength?: number;
    averageCycle?: number;
    irregularCount?: number;
  };
}

export interface CycleAnalysis {
  hasEnoughData: boolean;
  totalPeriods: number;
  averageCycleLength: number;
  shortestCycle: number;
  longestCycle: number;
  cycleVariation: number; // Difference between longest and shortest
  irregularCycleCount: number;
  regularCycleCount: number;
  regularity: 'regular' | 'slightly_irregular' | 'irregular' | 'very_irregular';
  pcosPatternDetected: boolean;
  trend: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
  alerts: IrregularityAlert[];
  lifestyleCorrelation?: {
    sleepImpact: string | null;
    supplementImpact: string | null;
  };
  aiRecommendation?: string;
  pcosInsight?: string;
}

/**
 * Analyze cycle irregularity for a user
 */
export async function analyzeCycleIrregularity(userId: string): Promise<CycleAnalysis> {
  const collection = getPeriodEntriesCollection();
  
  // Get last 12 periods (about 1 year of data)
  const periods = await collection
    .find({ userId })
    .sort({ startDate: -1 })
    .limit(12)
    .toArray();

  // Check if we have enough data
  if (periods.length < MIN_PERIODS_FOR_ANALYSIS) {
    return {
      hasEnoughData: false,
      totalPeriods: periods.length,
      averageCycleLength: 0,
      shortestCycle: 0,
      longestCycle: 0,
      cycleVariation: 0,
      irregularCycleCount: 0,
      regularCycleCount: 0,
      regularity: 'regular',
      pcosPatternDetected: false,
      trend: 'insufficient_data',
      alerts: [{
        type: 'info' as any,
        severity: 'info',
        title: '📊 More Data Needed',
        message: `You've logged ${periods.length} period${periods.length === 1 ? '' : 's'}. Log at least 2 periods to see cycle analysis.`,
        recommendation: 'Continue tracking your periods to get personalized insights about your cycle regularity.',
      }],
    };
  }

  // Calculate cycle lengths
  const cycleLengths: number[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    const currentStart = new Date(periods[i].startDate);
    const previousStart = new Date(periods[i + 1].startDate);
    const cycleLength = Math.round(
      (currentStart.getTime() - previousStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (cycleLength > 0 && cycleLength < 100) { // Sanity check
      cycleLengths.push(cycleLength);
    }
  }

  if (cycleLengths.length === 0) {
    return {
      hasEnoughData: false,
      totalPeriods: periods.length,
      averageCycleLength: 0,
      shortestCycle: 0,
      longestCycle: 0,
      cycleVariation: 0,
      irregularCycleCount: 0,
      regularCycleCount: 0,
      regularity: 'regular',
      pcosPatternDetected: false,
      trend: 'insufficient_data',
      alerts: [],
    };
  }

  // Calculate statistics
  const averageCycleLength = Math.round(
    cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
  );
  const shortestCycle = Math.min(...cycleLengths);
  const longestCycle = Math.max(...cycleLengths);
  const cycleVariation = longestCycle - shortestCycle;

  // Count irregular cycles
  let irregularCycleCount = 0;
  let shortCycleCount = 0;
  let longCycleCount = 0;

  cycleLengths.forEach(length => {
    if (length < MIN_CYCLE_LENGTH) {
      irregularCycleCount++;
      shortCycleCount++;
    } else if (length > MAX_CYCLE_LENGTH) {
      irregularCycleCount++;
      longCycleCount++;
    }
  });

  const regularCycleCount = cycleLengths.length - irregularCycleCount;

  // Determine regularity level
  let regularity: 'regular' | 'slightly_irregular' | 'irregular' | 'very_irregular' = 'regular';
  const irregularityRate = irregularCycleCount / cycleLengths.length;

  if (irregularityRate > 0.5 || cycleVariation > 14) {
    regularity = 'very_irregular';
  } else if (irregularityRate > 0.3 || cycleVariation > 10) {
    regularity = 'irregular';
  } else if (irregularityRate > 0 || cycleVariation > 7) {
    regularity = 'slightly_irregular';
  }

  // Detect PCOS pattern (multiple long cycles or high variation)
  const pcosPatternDetected = 
    longCycleCount >= PCOS_PATTERN_THRESHOLD || 
    (longestCycle > SEVERE_LONG_CYCLE && irregularCycleCount >= 2) ||
    (cycleVariation > 14 && cycleLengths.length >= 3);

  // Determine trend (compare recent cycles to older ones)
  let trend: 'improving' | 'worsening' | 'stable' | 'insufficient_data' = 'stable';
  if (cycleLengths.length >= 4) {
    const recentCycles = cycleLengths.slice(0, 2);
    const olderCycles = cycleLengths.slice(-2);
    
    const recentAvg = recentCycles.reduce((a, b) => a + b, 0) / recentCycles.length;
    const olderAvg = olderCycles.reduce((a, b) => a + b, 0) / olderCycles.length;
    
    const recentVariation = Math.abs(recentCycles[0] - recentCycles[1]);
    const olderVariation = Math.abs(olderCycles[0] - olderCycles[1]);

    // Check if cycles are becoming more regular
    if (recentVariation < olderVariation - 3 || 
        (Math.abs(recentAvg - 28) < Math.abs(olderAvg - 28) - 3)) {
      trend = 'improving';
    } else if (recentVariation > olderVariation + 3 ||
               (Math.abs(recentAvg - 28) > Math.abs(olderAvg - 28) + 3)) {
      trend = 'worsening';
    }
  }

  // Generate alerts
  const alerts = generateIrregularityAlerts(
    cycleLengths,
    averageCycleLength,
    shortestCycle,
    longestCycle,
    irregularCycleCount,
    pcosPatternDetected,
    trend
  );

  // Get lifestyle correlation
  const lifestyleCorrelation = await analyzeLifestyleCorrelation(userId, periods);

  // Get AI recommendations if irregular
  let aiRecommendation: string | undefined;
  let pcosInsight: string | undefined;

  if (regularity !== 'regular' || pcosPatternDetected) {
    const aiInsights = await generateAIRecommendations(
      cycleLengths,
      averageCycleLength,
      regularity,
      pcosPatternDetected,
      lifestyleCorrelation
    );
    aiRecommendation = aiInsights.recommendation;
    pcosInsight = aiInsights.pcosInsight;
  }

  return {
    hasEnoughData: true,
    totalPeriods: periods.length,
    averageCycleLength,
    shortestCycle,
    longestCycle,
    cycleVariation,
    irregularCycleCount,
    regularCycleCount,
    regularity,
    pcosPatternDetected,
    trend,
    alerts,
    lifestyleCorrelation,
    aiRecommendation,
    pcosInsight,
  };
}

/**
 * Generate irregularity alerts based on analysis
 */
function generateIrregularityAlerts(
  cycleLengths: number[],
  averageCycle: number,
  shortestCycle: number,
  longestCycle: number,
  irregularCount: number,
  pcosPattern: boolean,
  trend: string
): IrregularityAlert[] {
  const alerts: IrregularityAlert[] = [];
  const mostRecentCycle = cycleLengths[0];

  // Alert for most recent cycle being too short
  if (mostRecentCycle < MIN_CYCLE_LENGTH) {
    alerts.push({
      type: 'short_cycle',
      severity: mostRecentCycle < SEVERE_SHORT_CYCLE ? 'alert' : 'warning',
      title: '⚠️ Short Cycle Detected',
      message: `Your last cycle was ${mostRecentCycle} days, which is shorter than the typical 21-35 day range.`,
      recommendation: 'Short cycles can indicate hormonal imbalances. If this continues, consider consulting your healthcare provider.',
      data: { cycleLength: mostRecentCycle, averageCycle },
    });
  }

  // Alert for most recent cycle being too long
  if (mostRecentCycle > MAX_CYCLE_LENGTH) {
    alerts.push({
      type: 'long_cycle',
      severity: mostRecentCycle > SEVERE_LONG_CYCLE ? 'alert' : 'warning',
      title: '⚠️ Long Cycle Detected',
      message: `Your last cycle was ${mostRecentCycle} days, which is longer than the typical 21-35 day range.`,
      recommendation: 'Long or irregular cycles are common with PCOS. Lifestyle changes like regular exercise and balanced diet can help regulate cycles.',
      data: { cycleLength: mostRecentCycle, averageCycle },
    });
  }

  // PCOS pattern alert
  if (pcosPattern) {
    alerts.push({
      type: 'pcos_pattern',
      severity: 'alert',
      title: '🌸 PCOS Irregularity Pattern Detected',
      message: `You've had ${irregularCount} irregular cycles. This pattern is common in PCOS and may indicate hormonal imbalance.`,
      recommendation: 'Consider discussing these patterns with your healthcare provider. Managing insulin resistance through diet and exercise can help improve cycle regularity.',
      data: { irregularCount, averageCycle },
    });
  }

  // Improving trend alert (positive)
  if (trend === 'improving' && irregularCount > 0) {
    alerts.push({
      type: 'improving',
      severity: 'info',
      title: '📈 Your Cycles Are Improving!',
      message: 'Your recent cycles are becoming more regular compared to before.',
      recommendation: 'Keep up the good work! Whatever lifestyle changes you\'ve made seem to be helping. Continue with your current routine.',
    });
  }

  // Lifestyle impact alert
  if (irregularCount >= 2) {
    alerts.push({
      type: 'lifestyle_impact',
      severity: 'info',
      title: '💡 Lifestyle Tips for Regularity',
      message: 'Consistent sleep, stress management, and balanced nutrition can help regulate your cycle.',
      recommendation: 'Try to maintain 7-8 hours of sleep, reduce processed foods, and consider supplements like Inositol and Vitamin D which may help with PCOS.',
    });
  }

  return alerts;
}

/**
 * Analyze correlation between lifestyle factors and cycle regularity
 */
async function analyzeLifestyleCorrelation(
  userId: string,
  periods: any[]
): Promise<{ sleepImpact: string | null; supplementImpact: string | null }> {
  try {
    // Get sleep data for the period range
    const sleepCollection = getSleepEntriesCollection();
    const oldestPeriod = periods[periods.length - 1];
    const newestPeriod = periods[0];

    if (!oldestPeriod || !newestPeriod) {
      return { sleepImpact: null, supplementImpact: null };
    }

    const sleepEntries = await sleepCollection
      .find({
        userId,
        date: {
          $gte: oldestPeriod.startDate,
          $lte: newestPeriod.startDate,
        },
      })
      .toArray();

    let sleepImpact: string | null = null;
    if (sleepEntries.length >= 7) {
      const avgSleep = sleepEntries.reduce((sum, e) => sum + e.duration, 0) / sleepEntries.length;
      const avgHours = avgSleep / 60;

      if (avgHours < 6) {
        sleepImpact = 'Poor sleep (avg ' + avgHours.toFixed(1) + 'h) may be contributing to cycle irregularity.';
      } else if (avgHours >= 7) {
        sleepImpact = 'Good sleep habits (avg ' + avgHours.toFixed(1) + 'h) support hormonal balance.';
      }
    }

    // Get supplement consistency
    let supplementImpact: string | null = null;
    try {
      const supplementLogs = await getSupplementLogs(
        userId,
        oldestPeriod.startDate,
        newestPeriod.startDate
      );

      if (supplementLogs.length > 0) {
        const takenCount = supplementLogs.filter(l => l.taken).length;
        const consistency = (takenCount / supplementLogs.length) * 100;

        if (consistency >= 70) {
          supplementImpact = 'Good supplement consistency (' + Math.round(consistency) + '%) may help regulate your cycle.';
        } else if (consistency < 50) {
          supplementImpact = 'Low supplement consistency (' + Math.round(consistency) + '%). Consistent supplementation may help improve cycle regularity.';
        }
      }
    } catch (e) {
      // Supplement data not available
    }

    return { sleepImpact, supplementImpact };
  } catch (error) {
    console.error('Error analyzing lifestyle correlation:', error);
    return { sleepImpact: null, supplementImpact: null };
  }
}

/**
 * Generate AI-powered recommendations
 */
async function generateAIRecommendations(
  cycleLengths: number[],
  averageCycle: number,
  regularity: string,
  pcosPattern: boolean,
  lifestyleCorrelation: { sleepImpact: string | null; supplementImpact: string | null }
): Promise<{ recommendation: string; pcosInsight: string }> {
  try {
    const aiService = getAIService();

    const cycleDetails = cycleLengths.slice(0, 6).map((len, i) => 
      `Cycle ${i + 1}: ${len} days${len < 21 ? ' (short)' : len > 35 ? ' (long)' : ''}`
    ).join(', ');

    const prompt = `You are a women's health expert specializing in PCOS and menstrual health.

User's cycle data:
- Recent cycles: ${cycleDetails}
- Average cycle length: ${averageCycle} days
- Regularity: ${regularity}
- PCOS pattern detected: ${pcosPattern ? 'Yes' : 'No'}
${lifestyleCorrelation.sleepImpact ? `- Sleep: ${lifestyleCorrelation.sleepImpact}` : ''}
${lifestyleCorrelation.supplementImpact ? `- Supplements: ${lifestyleCorrelation.supplementImpact}` : ''}

Normal cycle range is 21-35 days. This user has ${regularity} cycles${pcosPattern ? ' with a pattern suggesting PCOS-related irregularity' : ''}.

Provide:
1. A personalized recommendation to help regulate their cycle (2-3 sentences, actionable)
2. An insight about how this relates to PCOS and what it means for their health (2 sentences)

Return ONLY valid JSON:
{
  "recommendation": "your personalized advice",
  "pcosInsight": "PCOS-specific insight"
}`;

    interface AIResponse {
      recommendation: string;
      pcosInsight: string;
    }

    const result = await aiService.generateJSON<AIResponse>(prompt);

    if (result.success && result.data) {
      return result.data;
    }

    return getDefaultRecommendations(regularity, pcosPattern);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return getDefaultRecommendations(regularity, pcosPattern);
  }
}

function getDefaultRecommendations(
  regularity: string,
  pcosPattern: boolean
): { recommendation: string; pcosInsight: string } {
  if (pcosPattern) {
    return {
      recommendation: 'Focus on insulin-sensitizing lifestyle changes: reduce refined carbs and sugar, exercise regularly (even 30 min walks help), and consider supplements like Inositol and Vitamin D after consulting your doctor.',
      pcosInsight: 'Irregular cycles in PCOS are often caused by hormonal imbalances and insulin resistance. Improving insulin sensitivity through lifestyle changes can help restore more regular ovulation and periods.',
    };
  }

  if (regularity === 'very_irregular' || regularity === 'irregular') {
    return {
      recommendation: 'Track your cycles consistently and note any lifestyle factors that might affect them. Prioritize sleep, manage stress, and maintain a balanced diet. If irregularity persists, consult your healthcare provider.',
      pcosInsight: 'Cycle irregularity can have various causes including stress, weight changes, and hormonal fluctuations. Consistent tracking helps identify patterns and potential triggers.',
    };
  }

  return {
    recommendation: 'Your cycles show some variation which is normal. Continue tracking and maintaining healthy habits. Focus on consistent sleep and stress management.',
    pcosInsight: 'Minor cycle variations are common and usually not a concern. Cycles between 21-35 days are considered normal.',
  };
}

/**
 * Get quick cycle status for dashboard
 */
export async function getCycleStatusForDashboard(userId: string): Promise<{
  hasAlert: boolean;
  alertMessage?: string;
  averageCycle: number;
  regularity: string;
  daysUntilNext?: number;
}> {
  const analysis = await analyzeCycleIrregularity(userId);

  const criticalAlert = analysis.alerts.find(
    a => a.severity === 'alert' || a.type === 'pcos_pattern'
  );

  // Calculate days until next period
  const collection = getPeriodEntriesCollection();
  const lastPeriod = await collection
    .find({ userId })
    .sort({ startDate: -1 })
    .limit(1)
    .toArray();

  let daysUntilNext: number | undefined;
  if (lastPeriod.length > 0 && analysis.averageCycleLength > 0) {
    const lastStart = new Date(lastPeriod[0].startDate);
    const predictedNext = new Date(lastStart);
    predictedNext.setDate(predictedNext.getDate() + analysis.averageCycleLength);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysUntilNext = Math.round(
      (predictedNext.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    hasAlert: analysis.alerts.some(a => a.severity === 'alert' || a.severity === 'warning'),
    alertMessage: criticalAlert?.message,
    averageCycle: analysis.averageCycleLength,
    regularity: analysis.regularity,
    daysUntilNext,
  };
}
