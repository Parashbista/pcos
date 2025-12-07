import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as moodService from './moodService';
import * as sleepService from './sleepService';
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
}

// Analyze user's recent health data and generate insights
export const analyzeHealthData = async (): Promise<HealthSummary> => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  let moodEntries: moodService.MoodEntry[] = [];
  let sleepEntries: sleepService.SleepEntry[] = [];

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

  const summary: HealthSummary = {
    moodAverage: Math.round(moodAverage * 10) / 10,
    sleepAverage: Math.round(sleepAverage * 10) / 10,
    sleepDurationAvg: Math.round(sleepDurationAvg),
    missedReminders: 0,
    daysAnalyzed: 7,
    riskLevel,
    insights: insights.sort((a, b) => b.priority - a.priority),
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
