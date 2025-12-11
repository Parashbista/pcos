import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, fontSize, fontWeight, spacing } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'colored';
  color?: string;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  variant = 'default',
  color = colors.primary,
  style,
}) => {
  if (variant === 'colored') {
    return (
      <View
        style={[
          {
            backgroundColor: color,
            paddingHorizontal: spacing.xl,
            paddingTop: 50,
            paddingBottom: spacing.xxxl,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          },
          style,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.title, fontWeight: fontWeight.bold, color: 'white' }}>
                {title}
              </Text>
              {subtitle && (
                <Text style={{ fontSize: fontSize.md, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.lg,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ padding: 4, marginRight: spacing.md }}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: fontSize.xxl, fontWeight: fontWeight.semibold, color: colors.textPrimary }}>
          {title}
        </Text>
      </View>
      {rightAction}
    </View>
  );
};
