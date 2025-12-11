/**
 * App Theme Constants
 * Centralized colors, spacing, and typography for consistent styling
 */

export const colors = {
  // Primary brand colors
  primary: '#EC4899',
  primaryLight: '#FDF2F8',
  primaryDark: '#BE185D',

  // Secondary colors for features
  mood: '#10B981',
  moodLight: '#F0FDF4',
  moodDark: '#166534',

  sleep: '#6366F1',
  sleepLight: '#EEF2FF',
  sleepDark: '#3730A3',

  period: '#EC4899',
  periodLight: '#FDF2F8',
  periodDark: '#9D174D',

  reminder: '#8B5CF6',
  reminderLight: '#F5F3FF',
  reminderDark: '#6D28D9',

  insights: '#F59E0B',
  insightsLight: '#FEF3C7',
  insightsDark: '#92400E',

  // Status colors
  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEF2F2',

  // Neutral colors
  white: '#FFFFFF',
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  round: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  xxl: 18,
  xxxl: 20,
  title: 24,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};
