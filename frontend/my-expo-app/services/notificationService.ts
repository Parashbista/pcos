import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Storage keys
const REMINDER_SETTINGS_KEY = 'period_reminder_settings';

export interface ReminderSettings {
  enabled: boolean;
  daysBeforePeriod: number[];  // e.g., [7, 3, 1] for 7 days, 3 days, 1 day before
  reminderTime: string;  // e.g., "09:00"
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  daysBeforePeriod: [7, 3, 1],
  reminderTime: '09:00',
};

// Reminder messages based on days before period
const getReminderMessage = (daysUntil: number): { title: string; body: string } => {
  if (daysUntil === 7) {
    return {
      title: '🌸 Period Coming Soon!',
      body: "Hey babe! Your period is expected in about a week. Time to stock up on supplies! 💕",
    };
  } else if (daysUntil === 3) {
    return {
      title: '💗 3 Days Until Period',
      body: "Your period is coming in 3 days! Remember to take care of yourself queen 👑",
    };
  } else if (daysUntil === 1) {
    return {
      title: '🩸 Period Tomorrow!',
      body: "Heads up! Your period is expected tomorrow. You've got this! 💪",
    };
  } else if (daysUntil === 0) {
    return {
      title: '🌺 Period Day',
      body: "Your period might start today. Take it easy and be kind to yourself 💖",
    };
  }
  return {
    title: `📅 ${daysUntil} Days Until Period`,
    body: `Your period is expected in ${daysUntil} days. Stay prepared! 💕`,
  };
};


/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('period-reminders', {
      name: 'Period Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EC4899',
    });
  }

  return true;
};

/**
 * Get reminder settings from storage
 */
export const getReminderSettings = async (): Promise<ReminderSettings> => {
  try {
    const stored = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading reminder settings:', error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Save reminder settings to storage
 */
export const saveReminderSettings = async (settings: ReminderSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving reminder settings:', error);
  }
};

/**
 * Cancel all scheduled period reminders
 */
export const cancelAllPeriodReminders = async (): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.identifier.startsWith('period-reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

/**
 * Schedule period reminders based on predicted date
 */
export const schedulePeriodReminders = async (
  predictedDate: string,
  settings?: ReminderSettings
): Promise<void> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const reminderSettings = settings || await getReminderSettings();
  if (!reminderSettings.enabled) return;

  // Cancel existing reminders first
  await cancelAllPeriodReminders();

  const predictedDateObj = new Date(predictedDate);
  const [hours, minutes] = reminderSettings.reminderTime.split(':').map(Number);

  for (const daysBefore of reminderSettings.daysBeforePeriod) {
    const reminderDate = new Date(predictedDateObj);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);
    reminderDate.setHours(hours, minutes, 0, 0);

    // Only schedule if the reminder date is in the future
    if (reminderDate > new Date()) {
      const message = getReminderMessage(daysBefore);

      await Notifications.scheduleNotificationAsync({
        identifier: `period-reminder-${daysBefore}`,
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      console.log(`Scheduled reminder for ${daysBefore} days before: ${reminderDate}`);
    }
  }
};

/**
 * Send immediate test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌸 Test Notification',
      body: 'Period reminders are working! You\'ll be notified before your next period 💕',
      sound: true,
    },
    trigger: null, // Send immediately
  });
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getScheduledReminders = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

// ============ FOOD & SUPPLEMENT REMINDERS ============

/**
 * Schedule a daily reminder notification
 */
export const scheduleReminderNotification = async (
  reminderId: string,
  name: string,
  type: 'food' | 'supplement' | 'medication',
  time: string,
  days: string[]
): Promise<void> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Configure Android channel for reminders
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
    });
  }

  const [hours, minutes] = time.split(':').map(Number);
  
  const getEmoji = () => {
    switch (type) {
      case 'food': return '🍎';
      case 'supplement': return '💊';
      case 'medication': return '💉';
      default: return '🔔';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'food': return `${getEmoji()} Time to eat!`;
      case 'supplement': return `${getEmoji()} Supplement Reminder`;
      case 'medication': return `${getEmoji()} Medication Time`;
      default: return `${getEmoji()} Reminder`;
    }
  };

  // Map day names to weekday numbers (1 = Sunday, 2 = Monday, etc. for Expo)
  const dayToWeekday: Record<string, number> = {
    'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4,
    'thursday': 5, 'friday': 6, 'saturday': 7
  };

  // Cancel existing notifications for this reminder
  await cancelReminderNotifications(reminderId);

  // Schedule for each selected day
  for (const day of days) {
    const weekday = dayToWeekday[day.toLowerCase()];
    if (!weekday) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `reminder-${reminderId}-${day}`,
        content: {
          title: getTitle(),
          body: `Don't forget: ${name}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { reminderId, type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: hours,
          minute: minutes,
        },
      });
    } catch (error) {
      console.error(`Error scheduling notification for ${day}:`, error);
    }
  }

  console.log(`Scheduled reminder notifications for: ${name} at ${time}`);
};

/**
 * Cancel all notifications for a specific reminder
 */
export const cancelReminderNotifications = async (reminderId: string): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.identifier.startsWith(`reminder-${reminderId}`)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

/**
 * Cancel all daily reminder notifications
 */
export const cancelAllDailyReminders = async (): Promise<void> => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.identifier.startsWith('reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

/**
 * Send immediate test reminder notification
 */
export const sendTestReminderNotification = async (name: string, type: string): Promise<void> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const emoji = type === 'food' ? '🍎' : type === 'supplement' ? '💊' : '💉';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} Reminder Test`,
      body: `This is how your "${name}" reminder will look!`,
      sound: true,
    },
    trigger: null,
  });
};
