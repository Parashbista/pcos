import React, { useState, useEffect } from 'react';
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
import { Heart, Mail, Lock, User, CheckCircle } from 'lucide-react-native';
import * as authService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VerifyEmailScreenProps {
  email: string;
  onVerificationSuccess?: (token: string, user: any) => void;
  onBack?: () => void;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  email,
  onVerificationSuccess,
  onBack,
}) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    setError('');

    // Validation
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authService.verifyAndRegister(
        email,
        code,
        password,
        name.trim() || undefined
      );

      // Store user data in AsyncStorage to trigger auth state update
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      if (onVerificationSuccess) {
        onVerificationSuccess(response.token, response.user);
      }
      
      // Force reload to trigger AuthContext to pick up the new token
      // The AuthContext will automatically detect the token and log the user in
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      await authService.requestVerificationCode(email);
      setTimeLeft(600); // Reset timer
      Alert.alert('Success', 'Verification code resent to your email');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: '#EC4899',
              paddingHorizontal: 24,
              paddingTop: 36,
              paddingBottom: 48,
              borderBottomLeftRadius: 36,
              borderBottomRightRadius: 36,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Mail size={32} color="white" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>
              Verify Your Email
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 4,
                textAlign: 'center',
              }}
            >
              We sent a code to {email}
            </Text>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, marginTop: -24 }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: 18,
                }}
              >
                Complete Registration
              </Text>

              {error ? (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {/* Timer */}
              <View
                style={{
                  backgroundColor: timeLeft < 60 ? '#FEF2F2' : '#F0FDF4',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 14,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: timeLeft < 60 ? '#DC2626' : '#16A34A',
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Code expires in: {formatTime(timeLeft)}
                </Text>
              </View>

              {/* Verification Code */}
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Verification Code
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <View style={{ paddingLeft: 14 }}>
                    <CheckCircle size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 46,
                      paddingHorizontal: 12,
                      fontSize: 20,
                      color: '#1F2937',
                      letterSpacing: 8,
                      fontWeight: '600',
                    }}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Name */}
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Name (Optional)
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <View style={{ paddingLeft: 14 }}>
                    <User size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 46,
                      paddingHorizontal: 12,
                      fontSize: 15,
                      color: '#1F2937',
                    }}
                    placeholder="Your name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <View style={{ paddingLeft: 14 }}>
                    <Lock size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 46,
                      paddingHorizontal: 12,
                      fontSize: 15,
                      color: '#1F2937',
                    }}
                    placeholder="Create password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Confirm Password
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}
                >
                  <View style={{ paddingLeft: 14 }}>
                    <Lock size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 46,
                      paddingHorizontal: 12,
                      fontSize: 15,
                      color: '#1F2937',
                    }}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={{
                  height: 50,
                  backgroundColor: isLoading ? '#F9A8D4' : '#EC4899',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                onPress={handleVerify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                style={{
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleResendCode}
                disabled={isLoading || timeLeft > 540} // Can resend after 1 minute
              >
                <Text
                  style={{
                    color: timeLeft > 540 ? '#9CA3AF' : '#EC4899',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Didn't receive code? Resend
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back Link */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 18,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity onPress={onBack} disabled={isLoading}>
                <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                  ← Back to Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
