import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled || loading) {
      return variant === 'primary' ? '#F9A8D4' : colors.borderLight;
    }
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.background;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.textPrimary;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.white;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 44;
      case 'lg': return 50;
      default: return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return fontSize.md;
      case 'md': return fontSize.lg;
      case 'lg': return fontSize.xl;
      default: return fontSize.lg;
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          height: getHeight(),
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.lg,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: fontWeight.semibold,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
