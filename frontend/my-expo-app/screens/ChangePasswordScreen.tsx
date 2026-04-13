import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface ChangePasswordScreenProps {
  onNavigateBack?: () => void;
  onChangePasswordSuccess?: () => void;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  onNavigateBack,
  onChangePasswordSuccess,
}) => {
  const { changePassword, isLoading } = useAuth();
  const { colors } = useThemedStyles();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => onChangePasswordSuccess?.() || onNavigateBack?.() }
      ]);
    } catch (err: any) {
      setError(err?.message || 'Failed to change password');
    }
  };

  const PasswordInput: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    toggleShow: () => void;
  }> = ({ label, value, onChangeText, placeholder, showPassword, toggleShow }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.borderLight, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ paddingLeft: 14 }}>
          <Lock size={18} color={colors.textMuted} />
        </View>
        <TextInput
          style={{ flex: 1, height: 50, paddingHorizontal: 12, fontSize: 15, color: colors.textPrimary }}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity onPress={toggleShow} style={{ paddingRight: 14 }}>
          {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background, borderBottomWidth: 0 }}>
        <TouchableOpacity onPress={onNavigateBack} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginLeft: 12 }}>Change Password</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          
          {/* Info Card */}
          <View style={{ backgroundColor: colors.reminderLight, borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 13, color: colors.reminderDark, lineHeight: 18 }}>
              🔒 Choose a strong password with at least 8 characters including letters and numbers.
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={{ backgroundColor: colors.errorLight, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 20 }}>
            <PasswordInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              showPassword={showCurrentPassword}
              toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              showPassword={showNewPassword}
              toggleShow={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirm new password"
              showPassword={showConfirmPassword}
              toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? colors.border : colors.textPrimary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={{ color: colors.background, fontSize: 16, fontWeight: '600' }}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
