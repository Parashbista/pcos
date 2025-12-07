/**
 * Environment Configuration
 * 
 * This file manages environment-specific configuration for the application.
 * It provides different API base URLs for development and production environments.
 */

interface EnvironmentConfig {
  API_BASE_URL: string;
}

/**
 * Development environment configuration
 * Use localhost for development on emulator/simulator
 * For physical devices, replace with your machine's local IP address (e.g., 'http://192.168.1.100:3000')
 */
const development: EnvironmentConfig = {
  API_BASE_URL: 'http://172.20.10.7:3000',
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
