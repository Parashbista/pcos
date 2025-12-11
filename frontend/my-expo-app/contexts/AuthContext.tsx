import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { User, RegisterData, LoginData, ChangePasswordData } from '../services/authService';

// Define the shape of the Auth Context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived state - user is authenticated if user object exists
  const isAuthenticated = user !== null;

  /**
   * Initialize auth state on app load
   * Check if token exists and validate it
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if token exists in storage
        const token = await authService.getToken();
        
        if (token) {
          // Token exists, but we need to validate it
          // We can do this by making a request to a protected endpoint
          // For now, we'll assume the token is valid if it exists
          // In a production app, you'd want to verify the token with the backend
          
          // Decode JWT to get user info (basic implementation)
          // Note: This is a simple decode, not verification
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
              // Token expired, clear it
              await authService.logout();
              setUser(null);
            } else {
              // Token is valid, load user data from AsyncStorage
              const storedUserData = await AsyncStorage.getItem('userData');
              if (storedUserData) {
                const userData = JSON.parse(storedUserData);
                setUser({
                  id: payload.userId,
                  email: userData.email || '',
                  name: userData.name || '',
                });
              } else {
                setUser({
                  id: payload.userId,
                  email: '',
                  name: '',
                });
              }
            }
          } catch (decodeError) {
            // If token decode fails, clear it
            console.error('Error decoding token:', decodeError);
            await authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user and clear authentication state
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.changePassword(data);
      // Password changed successfully, no need to update user state
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the Auth Context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
