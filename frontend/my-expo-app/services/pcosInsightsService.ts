import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as moodService from './moodService';
import * as sleepService from './sleepService';
import * as periodService from './periodService';
import api from './api';

// Storage keys
const INSIGHTS_KEY = 'pcos_insights_data';
const LAST_ANALYSIS_KEY = 'pcos_last_analysis';

export interface PCOSInsight {
  id: string;
  type: 'warning' | 'tip' | 'positive';
  category: 'mood' | 'sleep' | 'diet' | 'overall';
  title: string;
  message: string;
  priority: number; // 1-5, 5 being most urgent
  createdAt: string;
  isRead: boolean;
}

export interface HealthSummary {
  moodAverage: number;
  sleepAverage: number;
  sleepDurationAvg: number;
  missedReminders: number;
  daysAnalyzed: number;
  riskLevel: 'low' | 'moderate' | 'high';
  insights: PCOSInsight[];
  correlations: HealthCorrelation[];
}

export interface HealthCorrelation {
  id: string;
  type: 'mood-sleep' | 'mood-period' | 'sleep-period';
  title: string;
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
}

// Analyze user's recent health data and generate insights
export const analyzeHealthData = async (): Promise<HealthSummary> => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  const monthStartDate = monthAgo.toISOString().split('T')[0];

  let moodEntries: moodService.MoodEntry[] = [];
  let sleepEntries: sleepService.SleepEntry[] = [];
  let periodEntries: periodService.PeriodEntry[] = [];

  try {
    moodEntries = await moodService.getMoodEntries(startDate, endDate);
  } catch (e) {
    console.log('Could not fetch mood entries');
  }

  try {
    sleepEntries = await sleepService.getSleepEntries(startDate, endDate);
  } catch (e) {
    console.log('Could not fetch sleep entries');
  }

  try {
    periodEntries = await periodService.getPeriodEntries();
  } catch (e) {
    console.log('Could not fetch period entries');
  }

  // Calculate averages
  const moodAverage = moodEntries.length > 0 
    ? moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length 
    : 0;
  
  const sleepAverage = sleepEntries.length > 0 
    ? sleepEntries.reduce((sum, e) => sum + e.quality, 0) / sleepEntries.length 
    : 0;

  const sleepDurationAvg = sleepEntries.length > 0
    ? sleepEntries.reduce((sum, e) => sum + e.duration, 0) / sleepEntries.length
    : 0;

  // Generate insights based on data
  const insights: PCOSInsight[] = [];
  
  // Check for poor mood pattern
  if (moodAverage > 0 && moodAverage < 2.5) {
    insights.push({
      id: `mood-low-${Date.now()}`,
      type: 'warning',
      category: 'mood',
      title: '💛 Your mood needs attention',
      message: 'Your mood has been low this week. Poor mood can worsen PCOS symptoms. Try gentle exercise, meditation, or talking to someone you trust.',
      priority: 4,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Check for poor sleep pattern
  if (sleepAverage > 0 && sleepAverage < 2.5) {
    insights.push({
      id: `sleep-quality-${Date.now()}`,
      type: 'warning',
      category: 'sleep',
      title: '😴 Sleep quality is affecting you',
      message: 'Poor sleep disrupts hormones and worsens PCOS. Try a consistent bedtime, avoid screens before bed, and limit caffeine.',
      priority: 5,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Check for insufficient sleep duration
  if (sleepDurationAvg > 0 && sleepDurationAvg < 360) { // Less than 6 hours
    insights.push({
      id: `sleep-duration-${Date.now()}`,
      type: 'warning',
      category: 'sleep',
      title: '⏰ Not enough sleep',
      message: `You're averaging ${Math.round(sleepDurationAvg / 60)} hours of sleep. PCOS management needs 7-9 hours. Lack of sleep increases insulin resistance.`,
      priority: 5,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Combined mood + sleep warning
  if (moodAverage > 0 && moodAverage < 3 && sleepAverage > 0 && sleepAverage < 3) {
    insights.push({
      id: `combined-${Date.now()}`,
      type: 'warning',
      category: 'overall',
      title: '🚨 PCOS Alert: Multiple factors affected',
      message: 'Both your mood and sleep have been poor. This combination can significantly impact your hormones. Consider talking to your doctor and prioritizing self-care this week.',
      priority: 5,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Positive reinforcement
  if (moodAverage >= 4 && sleepAverage >= 4) {
    insights.push({
      id: `positive-${Date.now()}`,
      type: 'positive',
      category: 'overall',
      title: '🌟 You\'re doing great!',
      message: 'Your mood and sleep have been good this week! Keep up the healthy habits - they\'re helping manage your PCOS.',
      priority: 1,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Check for missing data
  if (moodEntries.length < 3) {
    insights.push({
      id: `track-mood-${Date.now()}`,
      type: 'tip',
      category: 'mood',
      title: '📝 Track your mood more',
      message: 'Logging your mood daily helps identify patterns related to your cycle. Try to log at least once a day!',
      priority: 2,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  if (sleepEntries.length < 3) {
    insights.push({
      id: `track-sleep-${Date.now()}`,
      type: 'tip',
      category: 'sleep',
      title: '🛏️ Track your sleep more',
      message: 'Regular sleep tracking helps you understand how rest affects your PCOS symptoms. Log your sleep each morning!',
      priority: 2,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  }

  // Determine overall risk level
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if ((moodAverage > 0 && moodAverage < 2.5) || (sleepAverage > 0 && sleepAverage < 2.5)) {
    riskLevel = 'moderate';
  }
  if ((moodAverage > 0 && moodAverage < 2.5) && (sleepAverage > 0 && sleepAverage < 2.5)) {
    riskLevel = 'high';
  }

  // Analyze correlations
  const correlations: HealthCorrelation[] = [];

  // Mood-Sleep correlation
  if (moodEntries.length >= 3 && sleepEntries.length >= 3) {
    const moodSleepCorrelation = analyzeMoodSleepCorrelation(moodEntries, sleepEntries);
    if (moodSleepCorrelation) {
      correlations.push(moodSleepCorrelation);
    }
  }

  // Period-Mood correlation
  if (periodEntries.length > 0 && moodEntries.length >= 3) {
    const periodMoodCorrelation = analyzePeriodMoodCorrelation(periodEntries, moodEntries);
    if (periodMoodCorrelation) {
      correlations.push(periodMoodCorrelation);
      // Add insight based on correlation
      if (periodMoodCorrelation.strength === 'strong') {
        insights.push({
          id: `period-mood-${Date.now()}`,
          type: 'tip',
          category: 'mood',
          title: '🔄 Cycle-Mood Pattern Detected',
          message: periodMoodCorrelation.description,
          priority: 3,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
    }
  }

  // Period-Sleep correlation
  if (periodEntries.length > 0 && sleepEntries.length >= 3) {
    const periodSleepCorrelation = analyzePeriodSleepCorrelation(periodEntries, sleepEntries);
    if (periodSleepCorrelation) {
      correlations.push(periodSleepCorrelation);
      if (periodSleepCorrelation.strength === 'strong') {
        insights.push({
          id: `period-sleep-${Date.now()}`,
          type: 'tip',
          category: 'sleep',
          title: '🌙 Cycle-Sleep Pattern Detected',
          message: periodSleepCorrelation.description,
          priority: 3,
          createdAt: new Date().toISOString(),
          isRead: false,
        });
      }
    }
  }

  const summary: HealthSummary = {
    moodAverage: Math.round(moodAverage * 10) / 10,
    sleepAverage: Math.round(sleepAverage * 10) / 10,
    sleepDurationAvg: Math.round(sleepDurationAvg),
    missedReminders: 0,
    daysAnalyzed: 7,
    riskLevel,
    insights: insights.sort((a, b) => b.priority - a.priority),
    correlations,
  };

  // Save analysis
  await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(summary));
  await AsyncStorage.setItem(LAST_ANALYSIS_KEY, new Date().toISOString());

  return summary;
};

// Get cached insights
export const getCachedInsights = async (): Promise<HealthSummary | null> => {
  try {
    const data = await AsyncStorage.getItem(INSIGHTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error getting cached insights:', e);
  }
  return null;
};

// Send smart notification based on health data
export const sendSmartNotification = async (): Promise<void> => {
  const summary = await analyzeHealthData();
  
  if (summary.insights.length === 0) return;

  // Get the highest priority insight
  const topInsight = summary.insights[0];
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: topInsight.title,
      body: topInsight.message,
      sound: true,
      data: { type: 'pcos_insight', insightId: topInsight.id },
    },
    trigger: null, // Send immediately
  });
};

// Schedule daily health check notification
export const scheduleDailyHealthCheck = async (): Promise<void> => {
  // Cancel existing health check notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.identifier === 'daily-health-check') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // Schedule for 8 PM daily
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-health-check',
    content: {
      title: '🌸 Daily Check-in',
      body: 'How was your day? Log your mood and sleep to track your PCOS journey.',
      sound: true,
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
};

// Get personalized tips based on recent data
export const getPersonalizedTips = async (): Promise<string[]> => {
  const summary = await getCachedInsights();
  const tips: string[] = [];

  if (!summary) {
    tips.push('Start tracking your mood and sleep to get personalized PCOS tips!');
    return tips;
  }

  if (summary.sleepDurationAvg < 420) { // Less than 7 hours
    tips.push('💤 Try to get 7-9 hours of sleep. It helps regulate insulin and hormones.');
  }

  if (summary.moodAverage < 3) {
    tips.push('🧘 Consider stress-reducing activities like yoga or meditation.');
    tips.push('🚶 A 30-minute walk can boost mood and help with PCOS symptoms.');
  }

  if (summary.sleepAverage < 3) {
    tips.push('📵 Avoid screens 1 hour before bed for better sleep quality.');
    tips.push('🍵 Try chamomile tea before bed - it can help with relaxation.');
  }

  if (summary.riskLevel === 'high') {
    tips.push('👩‍⚕️ Consider scheduling a check-up with your healthcare provider.');
    tips.push('🥗 Focus on anti-inflammatory foods like leafy greens and fatty fish.');
  }

  if (tips.length === 0) {
    tips.push('🌟 Keep up the great work! Your healthy habits are helping manage PCOS.');
  }

  return tips;
};


// Helper function to analyze mood-sleep correlation
const analyzeMoodSleepCorrelation = (
  moodEntries: moodService.MoodEntry[],
  sleepEntries: sleepService.SleepEntry[]
): HealthCorrelation | null => {
  // Create a map of dates to mood and sleep values
  const dateMap: { [key: string]: { mood?: number; sleep?: number } } = {};
  
  moodEntries.forEach(entry => {
    const date = entry.date.split('T')[0];
    if (!dateMap[date]) dateMap[date] = {};
    dateMap[date].mood = entry.mood;
  });
  
  sleepEntries.forEach(entry => {
    const date = entry.date.split('T')[0];
    if (!dateMap[date]) dateMap[date] = {};
    dateMap[date].sleep = entry.quality;
  });

  // Find days with both mood and sleep data
  const pairedData = Object.values(dateMap).filter(d => d.mood !== undefined && d.sleep !== undefined);
  
  if (pairedData.length < 3) return null;

  // Calculate correlation
  const lowSleepLowMood = pairedData.filter(d => d.sleep! < 3 && d.mood! < 3).length;
  const goodSleepGoodMood = pairedData.filter(d => d.sleep! >= 3 && d.mood! >= 3).length;
  const correlationScore = (lowSleepLowMood + goodSleepGoodMood) / pairedData.length;

  let strength: 'strong' | 'moderate' | 'weak' = 'weak';
  let description = '';

  if (correlationScore >= 0.7) {
    strength = 'strong';
    description = 'Your mood and sleep are strongly connected. Better sleep leads to better mood for you.';
  } else if (correlationScore >= 0.5) {
    strength = 'moderate';
    description = 'There\'s a moderate link between your sleep quality and mood.';
  } else {
    description = 'Your mood and sleep show some connection. Keep tracking for clearer patterns.';
  }

  return {
    id: 'mood-sleep-correlation',
    type: 'mood-sleep',
    title: 'Mood & Sleep Connection',
    description,
    strength,
  };
};

// Helper function to analyze period-mood correlation
const analyzePeriodMoodCorrelation = (
  periodEntries: periodService.PeriodEntry[],
  moodEntries: moodService.MoodEntry[]
): HealthCorrelation | null => {
  if (periodEntries.length === 0) return null;

  // Get period dates
  const periodDates = new Set<string>();
  periodEntries.forEach(entry => {
    const start = new Date(entry.startDate);
    const end = entry.endDate ? new Date(entry.endDate) : start;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      periodDates.add(d.toISOString().split('T')[0]);
    }
  });

  // Calculate average mood during and outside period
  let periodMoodSum = 0, periodMoodCount = 0;
  let nonPeriodMoodSum = 0, nonPeriodMoodCount = 0;

  moodEntries.forEach(entry => {
    const date = entry.date.split('T')[0];
    if (periodDates.has(date)) {
      periodMoodSum += entry.mood;
      periodMoodCount++;
    } else {
      nonPeriodMoodSum += entry.mood;
      nonPeriodMoodCount++;
    }
  });

  if (periodMoodCount === 0 || nonPeriodMoodCount === 0) return null;

  const periodMoodAvg = periodMoodSum / periodMoodCount;
  const nonPeriodMoodAvg = nonPeriodMoodSum / nonPeriodMoodCount;
  const moodDiff = nonPeriodMoodAvg - periodMoodAvg;

  let strength: 'strong' | 'moderate' | 'weak' = 'weak';
  let description = '';

  if (moodDiff >= 1.5) {
    strength = 'strong';
    description = `Your mood drops significantly during your period (avg ${periodMoodAvg.toFixed(1)} vs ${nonPeriodMoodAvg.toFixed(1)}). This is common with PCOS - plan extra self-care during this time.`;
  } else if (moodDiff >= 0.8) {
    strength = 'moderate';
    description = `Your mood tends to be lower during your period. Consider gentle activities and rest during this phase.`;
  } else if (moodDiff > 0) {
    description = `Your mood is slightly affected by your cycle. Keep tracking to understand your patterns better.`;
  } else {
    description = `Great news! Your mood stays relatively stable throughout your cycle.`;
  }

  return {
    id: 'period-mood-correlation',
    type: 'mood-period',
    title: 'Cycle & Mood Pattern',
    description,
    strength,
  };
};

// Helper function to analyze period-sleep correlation
const analyzePeriodSleepCorrelation = (
  periodEntries: periodService.PeriodEntry[],
  sleepEntries: sleepService.SleepEntry[]
): HealthCorrelation | null => {
  if (periodEntries.length === 0) return null;

  // Get period dates
  const periodDates = new Set<string>();
  periodEntries.forEach(entry => {
    const start = new Date(entry.startDate);
    const end = entry.endDate ? new Date(entry.endDate) : start;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      periodDates.add(d.toISOString().split('T')[0]);
    }
  });

  // Calculate average sleep during and outside period
  let periodSleepSum = 0, periodSleepCount = 0;
  let nonPeriodSleepSum = 0, nonPeriodSleepCount = 0;

  sleepEntries.forEach(entry => {
    const date = entry.date.split('T')[0];
    if (periodDates.has(date)) {
      periodSleepSum += entry.quality;
      periodSleepCount++;
    } else {
      nonPeriodSleepSum += entry.quality;
      nonPeriodSleepCount++;
    }
  });

  if (periodSleepCount === 0 || nonPeriodSleepCount === 0) return null;

  const periodSleepAvg = periodSleepSum / periodSleepCount;
  const nonPeriodSleepAvg = nonPeriodSleepSum / nonPeriodSleepCount;
  const sleepDiff = nonPeriodSleepAvg - periodSleepAvg;

  let strength: 'strong' | 'moderate' | 'weak' = 'weak';
  let description = '';

  if (sleepDiff >= 1.5) {
    strength = 'strong';
    description = `Your sleep quality drops during your period (avg ${periodSleepAvg.toFixed(1)} vs ${nonPeriodSleepAvg.toFixed(1)}). Try relaxation techniques before bed during this time.`;
  } else if (sleepDiff >= 0.8) {
    strength = 'moderate';
    description = `Your sleep is somewhat affected during your period. Consider a calming bedtime routine during this phase.`;
  } else if (sleepDiff > 0) {
    description = `Your sleep is slightly affected by your cycle. Keep tracking for more insights.`;
  } else {
    description = `Your sleep quality stays consistent throughout your cycle - that's great for hormone balance!`;
  }

  return {
    id: 'period-sleep-correlation',
    type: 'sleep-period',
    title: 'Cycle & Sleep Pattern',
    description,
    strength,
  };
};
