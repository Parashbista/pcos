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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) => {
  const { login, isLoading } = useAuth();
  const { colors } = useThemedStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    if (!validateForm()) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, alignItems: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Heart size={36} color="white" fill="white" />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '700', color: 'white' }}>PCOS Tracker</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>Your health companion</Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, marginTop: -28 }}>
            <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 }}>Welcome Back</Text>

              {error ? (
                <View style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: fieldErrors.email ? '#EF4444' : colors.border }}>
                  <View style={{ paddingLeft: 14 }}>
                    <Mail size={18} color={colors.textMuted} />
                  </View>
                  <TextInput
                    style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: colors.textPrimary }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={(text) => { setEmail(text); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined }); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.email && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</Text>}
              </View>

              {/* Password */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 }}>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: fieldErrors.password ? '#EF4444' : colors.border }}>
                  <View style={{ paddingLeft: 14 }}>
                    <Lock size={18} color={colors.textMuted} />
                  </View>
                  <TextInput
                    style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: colors.textPrimary }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={(text) => { setPassword(text); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined }); }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.password && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.password}</Text>}
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity onPress={onNavigateToForgotPassword} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                <Text style={{ color: '#EC4899', fontSize: 13, fontWeight: '500' }}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={{ height: 50, backgroundColor: isLoading ? '#F9A8D4' : '#EC4899', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Sign In</Text>}
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Don't have an account? </Text>
              <TouchableOpacity onPress={onNavigateToRegister} disabled={isLoading}>
                <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
