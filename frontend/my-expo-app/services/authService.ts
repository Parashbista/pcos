import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Token storage key
const TOKEN_KEY = 'authToken';

// Type definitions for API requests and responses
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Store authentication token in AsyncStorage
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve authentication token from AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Remove authentication token from AsyncStorage
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    
    // Store token after successful registration
    await storeToken(response.data.token);
    
    // Store user data
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Login an existing user
 * POST /api/auth/login
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    
    // Store token after successful login
    await storeToken(response.data.token);
    
    // Store user data
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Change user password
 * POST /api/auth/change-password
 * Requires authentication token
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/api/auth/change-password', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Logout user by removing stored token
 */
export const logout = async (): Promise<void> => {
  await removeToken();
  await AsyncStorage.removeItem('userData');
};

/**
 * Request password reset OTP
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Reset password with OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/api/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Google Sign-In
 * POST /api/auth/google
 */
export const googleSignIn = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/api/auth/google', { idToken });
    await storeToken(response.data.token);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
