import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication stack navigator
 * Contains Login, Register, and ForgotPassword screens
 */
export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen
            onNavigateToRegister={() => navigation.navigate('Register')}
            onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
            onLoginSuccess={() => {
              // Navigation will be handled by the root navigator
              // based on authentication state
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen
            onNavigateToLogin={() => navigation.navigate('Login')}
            onRegisterSuccess={() => {
              // Navigation will be handled by the root navigator
              // based on authentication state
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            onNavigateBack={() => navigation.goBack()}
            onResetSuccess={() => navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
