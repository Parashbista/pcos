# Network Connection Troubleshooting Guide

## Problem
Your mobile app shows: "Unable to connect. Please check your internet connection."

## Root Cause
The mobile device cannot reach the backend server at the detected IP address.

## Solutions (Try in Order)

### 1. Restart Backend Server (REQUIRED)
The backend now listens on `0.0.0.0` to accept connections from your mobile device.

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd backend
npm run dev
```

You should see:
```
✓ Server is running on port 3000
✓ Server accessible at:
   - Local: http://localhost:3000
   - Network: http://0.0.0.0:3000
```

### 2. Check Same WiFi Network
- Ensure your computer and mobile device are on the SAME WiFi network
- Don't use VPN on either device
- Disable any firewall temporarily to test

### 3. Find Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### 4. Test Backend Connection

From your mobile device browser, visit:
```
http://YOUR_COMPUTER_IP:3000/health
```

Example: `http://192.168.1.100:3000/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

### 5. Manual IP Configuration (If Auto-Detection Fails)

Edit `frontend/my-expo-app/config/environment.ts`:

```typescript
const development: EnvironmentConfig = {
  API_BASE_URL: 'http://YOUR_COMPUTER_IP:3000', // Replace with your actual IP
};
```

Then restart Expo:
```bash
cd frontend/my-expo-app
npm start
```

### 6. Windows Firewall Configuration

If still not working, allow Node.js through Windows Firewall:

1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find "Node.js" and check both Private and Public
4. If not listed, click "Allow another app" and browse to Node.js

### 7. Use Expo Tunnel (Last Resort)

If local network doesn't work, use Expo's tunnel:

```bash
cd frontend/my-expo-app
npx expo start --tunnel
```

Note: This is slower but works across any network.

## Quick Checklist

- [ ] Backend server restarted with new configuration
- [ ] Computer and phone on same WiFi
- [ ] No VPN active
- [ ] Firewall allows Node.js
- [ ] Can access http://YOUR_IP:3000/health from phone browser
- [ ] Expo app restarted after any changes

## Current Configuration

Your app auto-detects the IP from Expo. Check the logs when starting the app:

```
🌐 Environment Config:
   debuggerHost: 172.20.10.7:8081
   Detected IP: 172.20.10.7
   API URL: http://172.20.10.7:3000
```

The detected IP (172.20.10.7 in your case) should match your computer's IP address.

## Still Not Working?

1. Check backend logs for incoming requests
2. Try accessing from phone browser first
3. Temporarily disable all firewalls
4. Use USB debugging with `adb reverse` (Android only):
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```
   Then use `http://localhost:3000` in the app
