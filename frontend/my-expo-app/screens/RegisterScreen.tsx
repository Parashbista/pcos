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
import { Heart, Mail } from 'lucide-react-native';
import * as authService from '../services/authService';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onNavigateToVerify?: (email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onNavigateToVerify,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await authService.requestVerificationCode(email.trim().toLowerCase());
      
      // Navigate to verification screen
      if (onNavigateToVerify) {
        onNavigateToVerify(email.trim().toLowerCase());
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send verification code');
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
              <Heart size={32} color="white" fill="white" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: 'white' }}>
              Join PCOS Tracker
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
                marginTop: 4,
              }}
            >
              Start your health journey
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
                  marginBottom: 8,
                }}
              >
                Create Account
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                  marginBottom: 18,
                }}
              >
                We'll send a verification code to your email
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

              {/* Email */}
              <View style={{ marginBottom: 18 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? '#EF4444' : '#E5E7EB',
                  }}
                >
                  <View style={{ paddingLeft: 14 }}>
                    <Mail size={18} color="#9CA3AF" />
                  </View>
                  <TextInput
                    style={{
                      flex: 1,
                      height: 46,
                      paddingHorizontal: 12,
                      fontSize: 15,
                      color: '#1F2937',
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    keyboardType="email-address"
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
                }}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Send Verification Code
                  </Text>
                )}
              </TouchableOpacity>

              {/* Info */}
              <View
                style={{
                  backgroundColor: '#F0FDF4',
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 14,
                }}
              >
                <Text style={{ color: '#16A34A', fontSize: 12, textAlign: 'center' }}>
                  🔒 We'll send a 6-digit code to verify your email
                </Text>
              </View>
            </View>

            {/* Login Link */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 18,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: '#6B7280', fontSize: 14 }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
