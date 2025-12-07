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
import { Heart, Mail, Lock, User } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Min 8 characters';
    if (!confirmPassword) errors.confirmPassword = 'Confirm password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords don\'t match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    if (!validateForm()) return;

    try {
      await register({ email: email.trim().toLowerCase(), password, name: name.trim() || undefined });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 24, paddingTop: 36, paddingBottom: 48, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Heart size={32} color="white" fill="white" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>Join PCOS Tracker</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Start your health journey</Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, marginTop: -24 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 18 }}>Create Account</Text>

              {error ? (
                <View style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {/* Name */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Name (Optional)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <View style={{ paddingLeft: 14 }}><User size={18} color="#9CA3AF" /></View>
                  <TextInput
                    style={{ flex: 1, height: 46, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                    placeholder="Your name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: fieldErrors.email ? '#EF4444' : '#E5E7EB' }}>
                  <View style={{ paddingLeft: 14 }}><Mail size={18} color="#9CA3AF" /></View>
                  <TextInput
                    style={{ flex: 1, height: 46, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
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
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: fieldErrors.password ? '#EF4444' : '#E5E7EB' }}>
                  <View style={{ paddingLeft: 14 }}><Lock size={18} color="#9CA3AF" /></View>
                  <TextInput
                    style={{ flex: 1, height: 46, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                    placeholder="Create password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => { setPassword(text); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined }); }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.password && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.password}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Confirm Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: fieldErrors.confirmPassword ? '#EF4444' : '#E5E7EB' }}>
                  <View style={{ paddingLeft: 14 }}><Lock size={18} color="#9CA3AF" /></View>
                  <TextInput
                    style={{ flex: 1, height: 46, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: undefined }); }}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {fieldErrors.confirmPassword && <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{fieldErrors.confirmPassword}</Text>}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={{ height: 50, backgroundColor: isLoading ? '#F9A8D4' : '#EC4899', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Create Account</Text>}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 24 }}>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
