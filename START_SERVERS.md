# Quick Start Guide - Fix Connection Issues

## Step 1: Start Backend Server (REQUIRED - DO THIS FIRST!)

Open a terminal and run:

```bash
cd backend
npm run dev
```

**IMPORTANT:** Look for this message:
```
✓ Server is running on port 3000
✓ Server accessible at:
   - Local: http://localhost:3000
   - Network: http://0.0.0.0:3000
```

If you see this, the backend is now configured to accept connections from your mobile device!

## Step 2: Test Backend is Working

Open your phone's browser and visit:
```
http://172.20.10.7:3000/health
```

You should see a JSON response like:
```json
{"status": "ok", "timestamp": "...", "uptime": 123}
```

If this works, your backend is accessible! If not, see NETWORK_TROUBLESHOOTING.md

## Step 3: Start Frontend (Expo)

Open another terminal and run:

```bash
cd frontend/my-expo-app
npm start
```

Then scan the QR code with Expo Go app.

## Step 4: Verify in App

Check the app logs. You should see:
```
🌐 Environment Config:
   debuggerHost: 172.20.10.7:8081
   Detected IP: 172.20.10.7
   API URL: http://172.20.10.7:3000
```

And API requests should work:
```
📤 API Request Details:
   URL: /api/chatbot/suggestions
   Base URL: http://172.20.10.7:3000
   Full URL: http://172.20.10.7:3000/api/chatbot/suggestions
   Method: GET
   Token exists: true
```

## What Changed?

1. **Backend now listens on 0.0.0.0** - This allows connections from any device on your network, not just localhost
2. **Increased timeout to 30 seconds** - Better reliability for slower connections
3. **Better logging** - You can see exactly what's happening

## Still Having Issues?

See NETWORK_TROUBLESHOOTING.md for detailed solutions.
