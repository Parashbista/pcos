# Environment Configuration

This directory contains environment-specific configuration for the application.

## Configuration File

`environment.ts` - Manages API base URLs and other environment-specific settings.

## Usage

The configuration automatically switches between development and production based on the `__DEV__` flag:

- **Development**: Uses `http://localhost:3000` by default
- **Production**: Uses the production API URL (update in `environment.ts`)

## Development Setup

### For Emulator/Simulator
The default `http://localhost:3000` works out of the box.

### For Physical Devices
You need to use your computer's local IP address instead of localhost:

1. Find your local IP address:
   - **Windows**: Run `ipconfig` in Command Prompt, look for IPv4 Address
   - **macOS/Linux**: Run `ifconfig` or `ip addr`, look for your network interface IP

2. Update the `development.API_BASE_URL` in `environment.ts`:
   ```typescript
   const development: EnvironmentConfig = {
     API_BASE_URL: 'http://192.168.1.100:3000', // Replace with your IP
   };
   ```

3. Ensure your backend server is running and accessible on your local network.

## Production Setup

Before deploying to production:

1. Update the `production.API_BASE_URL` in `environment.ts` with your production API URL:
   ```typescript
   const production: EnvironmentConfig = {
     API_BASE_URL: 'https://api.yourapp.com',
   };
   ```

2. Ensure your production API has CORS configured to accept requests from your app.

## Adding New Configuration

To add new environment-specific settings:

1. Update the `EnvironmentConfig` interface:
   ```typescript
   interface EnvironmentConfig {
     API_BASE_URL: string;
     NEW_SETTING: string;
   }
   ```

2. Add the setting to both `development` and `production` objects:
   ```typescript
   const development: EnvironmentConfig = {
     API_BASE_URL: 'http://localhost:3000',
     NEW_SETTING: 'dev-value',
   };

   const production: EnvironmentConfig = {
     API_BASE_URL: 'https://api.yourapp.com',
     NEW_SETTING: 'prod-value',
   };
   ```

3. Import and use the config in your code:
   ```typescript
   import config from '../config/environment';
   
   console.log(config.NEW_SETTING);
   ```
