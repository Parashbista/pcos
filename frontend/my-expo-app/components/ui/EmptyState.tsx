import React from 'react';
import { View, Text } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          fontSize: fontSize.xxl,
          fontWeight: fontWeight.semibold,
          color: colors.textPrimary,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: fontSize.base,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: spacing.lg,
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="sm" />
      )}
    </View>
  );
};
