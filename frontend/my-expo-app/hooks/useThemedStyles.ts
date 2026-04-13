import { useTheme } from '../contexts/ThemeContext';

/**
 * Hook that provides commonly used themed styles
 * Makes it easy to apply dark mode across all screens
 */
export const useThemedStyles = () => {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();

  return {
    isDarkMode,
    colors,
    toggleDarkMode,
    
    // Common container styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
    },
    
    // Text styles
    textPrimary: {
      color: colors.textPrimary,
    },
    
    textSecondary: {
      color: colors.textSecondary,
    },
    
    textMuted: {
      color: colors.textMuted,
    },
    
    // Input styles
    input: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      color: colors.textPrimary,
    },
    
    // Border styles
    border: {
      borderColor: colors.border,
    },
    
    borderLight: {
      borderColor: colors.borderLight,
    },
  };
};
