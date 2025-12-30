import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackType, FEEDBACK_OPTIONS } from '../../services/moodService';
import { colors, spacing, fontSize } from '../../constants/theme';

interface FeedbackModalProps {
  visible: boolean;
  recommendationTitle: string;
  onSubmit: (feedback: FeedbackType, comment?: string) => void;
  onClose: () => void;
}

export default function FeedbackModal({ 
  visible, 
  recommendationTitle, 
  onSubmit, 
  onClose 
}: FeedbackModalProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!selectedFeedback) return;
    onSubmit(selectedFeedback, selectedFeedback === 'improve' ? comment : undefined);
    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFeedback(null);
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.title}>How was this activity?</Text>
          <Text style={styles.subtitle}>"{recommendationTitle}"</Text>

          <View style={styles.feedbackOptions}>
            {FEEDBACK_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.feedbackOption,
                  selectedFeedback === option.value && styles.feedbackOptionActive,
                ]}
                onPress={() => setSelectedFeedback(option.value)}
              >
                <Text style={styles.feedbackEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.feedbackLabel,
                  selectedFeedback === option.value && styles.feedbackLabelActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedFeedback === 'improve' && (
            <TextInput
              style={styles.commentInput}
              placeholder="Any suggestions? (optional)"
              placeholderTextColor={colors.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.skipButton} onPress={handleClose}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, !selectedFeedback && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedFeedback}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  feedbackOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  feedbackOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.background,
    minWidth: 80,
  },
  feedbackOptionActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  feedbackEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  feedbackLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  feedbackLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  commentInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: fontSize.md,
    color: '#fff',
    fontWeight: '600',
  },
});
