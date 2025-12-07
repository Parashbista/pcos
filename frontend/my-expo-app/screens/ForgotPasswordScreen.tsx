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
import { Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react-native';
import { forgotPassword, resetPassword } from '../services/authService';

interface ForgotPasswordScreenProps {
  onNavigateBack?: () => void;
  onResetSuccess?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ 
  onNavigateBack, 
  onResetSuccess 
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSuccess('OTP sent to your email');
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email.trim().toLowerCase(), otp, newPassword);
      setSuccess('Password reset successfully!');
      setTimeout(() => onResetSuccess?.(), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={{ backgroundColor: '#EC4899', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 56, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 }}>
            <TouchableOpacity onPress={onNavigateBack} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <ArrowLeft size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 16, marginLeft: 8 }}>Back</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <KeyRound size={36} color="white" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: 'white' }}>Reset Password</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
                {step === 'email' ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={{ paddingHorizontal: 24, marginTop: -28 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
              
              {error ? (
                <View style={{ backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: '#DC2626', fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={{ backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <Text style={{ color: '#16A34A', fontSize: 13 }}>{success}</Text>
                </View>
              ) : null}

              {step === 'email' ? (
                <>
                  {/* Email Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Email</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <View style={{ paddingLeft: 14 }}><Mail size={18} color="#9CA3AF" /></View>
                      <TextInput
                        style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{ height: 50, backgroundColor: isLoading ? '#F9A8D4' : '#EC4899', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleSendOTP}
                    disabled={isLoading}
                  >
                    {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Send OTP</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>OTP Code</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <View style={{ paddingLeft: 14 }}><KeyRound size={18} color="#9CA3AF" /></View>
                      <TextInput
                        style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: '#1F2937', letterSpacing: 4 }}
                        placeholder="Enter 6-digit OTP"
                        placeholderTextColor="#9CA3AF"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!isLoading}
                      />
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>New Password</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <View style={{ paddingLeft: 14 }}><Lock size={18} color="#9CA3AF" /></View>
                      <TextInput
                        style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        editable={!isLoading}
                      />
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 }}>Confirm Password</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <View style={{ paddingLeft: 14 }}><Lock size={18} color="#9CA3AF" /></View>
                      <TextInput
                        style={{ flex: 1, height: 48, paddingHorizontal: 12, fontSize: 15, color: '#1F2937' }}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!isLoading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{ height: 50, backgroundColor: isLoading ? '#F9A8D4' : '#EC4899', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Reset Password</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setStep('email'); setOtp(''); setError(''); }} style={{ marginTop: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#EC4899', fontSize: 14 }}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
