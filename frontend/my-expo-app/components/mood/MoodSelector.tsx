import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { MOOD_OPTIONS, MoodLevel } from '../../services/moodService';
import { colors, spacing, fontSize } from '../../constants/theme';

interface MoodSelectorProps {
  selectedMood: MoodLevel | null;
  onMoodSelect: (mood: MoodLevel) => void;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MoodSelector({ selectedMood, onMoodSelect, disabled }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => (
          <MoodButton
            key={option.value}
            option={option}
            isSelected={selectedMood === option.value}
            onPress={() => onMoodSelect(option.value)}
            disabled={disabled}
          />
        ))}
      </View>
      {selectedMood && (
        <Text style={styles.selectedLabel}>
          {MOOD_OPTIONS.find(m => m.value === selectedMood)?.label}
        </Text>
      )}
    </View>
  );
}

interface MoodButtonProps {
  option: typeof MOOD_OPTIONS[0];
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function MoodButton({ option, isSelected, onPress, disabled }: MoodButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.moodButton,
        isSelected && { backgroundColor: option.color + '20', borderColor: option.color },
        animatedStyle,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{option.emoji}</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 28,
  },
  selectedLabel: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
