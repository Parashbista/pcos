/**
 * Environment Configuration
 *
 * This file manages environment-specific configuration for the application.
 * It automatically detects the development server IP for physical devices.
 */

import Constants from 'expo-constants';

interface EnvironmentConfig {
  API_BASE_URL: string;
}

/**
 * Get the development API URL
 * - Uses Expo's debuggerHost to automatically get the correct IP
 * - Falls back to localhost for simulators/emulators
 */
const getDevApiUrl = (): string => {
  // Get the debugger host from Expo (includes IP and port like "192.168.1.100:8081")
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    // Extract just the IP address (remove the Metro bundler port)
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:3000`;
  }

  // Fallback for emulators
  return 'http://localhost:3000';
};

/**
 * Development environment configuration
 * Automatically detects IP address from Expo
 */
const development: EnvironmentConfig = {
  API_BASE_URL: getDevApiUrl(),
};

/**
 * Production environment configuration
 * Update this with your production API URL when deploying
 */
const production: EnvironmentConfig = {
  API_BASE_URL: 'https://your-production-api.com',
};

/**
 * Get the current environment configuration based on __DEV__ flag
 * __DEV__ is true when running in development mode, false in production
 */
const getEnvironmentConfig = (): EnvironmentConfig => {
  return __DEV__ ? development : production;
};

export const config = getEnvironmentConfig();
export default config;
