import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

// Configure API base URL from environment configuration
const API_BASE_URL = config.API_BASE_URL;

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      // If token exists, add it to Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from storage:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return successful response as-is
    return response;
  },
  async (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - token expired or invalid
      if (status === 401) {
        // Clear stored token
        try {
          await AsyncStorage.removeItem('authToken');
        } catch (storageError) {
          console.error('Error clearing token:', storageError);
        }
        
        // You can dispatch a logout action here if using state management
        console.log('Authentication failed - token cleared');
      }
      
      // Return formatted error with message from server
      return Promise.reject({
        status,
        message: data?.error || data?.message || 'An error occurred',
        details: data?.details,
      });
    } else if (error.request) {
      // Request was made but no response received (network error)
      return Promise.reject({
        status: 0,
        message: 'Unable to connect. Please check your internet connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;
