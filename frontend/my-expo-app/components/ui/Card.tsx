import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return spacing.md;
      case 'md': return spacing.lg;
      case 'lg': return spacing.xl;
      default: return spacing.lg;
    }
  };

  const getStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      padding: getPadding(),
    };

    switch (variant) {
      case 'elevated':
        return { ...baseStyle, ...shadows.lg };
      case 'outlined':
        return { ...baseStyle, borderWidth: 1, borderColor: colors.border };
      default:
        return { ...baseStyle, ...shadows.sm };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[getStyle(), style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getStyle(), style]}>{children}</View>;
};
