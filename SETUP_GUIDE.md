# Quick Setup Guide for Defense Demo

## Prerequisites Checklist
- [ ] Node.js installed (v18+)
- [ ] MongoDB Atlas account accessible
- [ ] Expo Go app installed on phone
- [ ] Phone and laptop on same WiFi network

## 5-Minute Setup Before Defense

### 1. Backend Setup (2 minutes)
```bash
# Open Terminal 1
cd backend
npm install
npm run dev
```

Wait for:
- ✓ Successfully connected to MongoDB Atlas
- ✓ Server running on port 3000

### 2. Frontend Setup (2 minutes)
```bash
# Open Terminal 2
cd frontend/my-expo-app
npm install
npm start
```

Scan QR code with Expo Go app

### 3. Quick Test (1 minute)
- Open app on phone
- Register a test account
- Log in successfully
- Navigate to home screen

## Common Issues & Quick Fixes

### Backend won't start
**Error:** MongoDB connection failed
**Fix:** 
1. Check internet connection
2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0)
3. Check .env file has correct MONGODB_URI

### Frontend can't connect
**Error:** Network request failed
**Fix:**
1. Ensure backend is running (check Terminal 1)
2. Phone and laptop on same WiFi
3. Check Windows Firewall allows port 3000

### App crashes on phone
**Fix:**
1. Close and reopen Expo Go
2. Shake phone → Reload
3. Check Terminal 2 for errors

## Demo Flow (2-3 minutes)

1. **Authentication** (30 sec)
   - Show registration
   - Login with test account

2. **Core Features** (90 sec)
   - Log period date
   - Track mood
   - Log sleep
   - Set reminder
   - View calendar

3. **Advanced Features** (30 sec)
   - AI chatbot
   - Moodboard
   - Data export

## Key Points to Mention

- **Tech Stack:** React Native (Expo) + Node.js + MongoDB
- **Architecture:** MVC pattern, RESTful API
- **Security:** JWT auth, bcrypt hashing
- **Testing:** 85%+ coverage, Jest
- **Features:** 11 core features implemented
- **Development:** Agile methodology, 4 sprints

## Emergency Backup

If live demo fails:
1. Have screenshots ready
2. Show code architecture
3. Explain features from documentation
4. Show test results

## Contact Info

**Student:** Parash Bista  
**ID:** np03cs4a230009  
**Email:** parashbista234@gmail.com

---

**Good luck with your defense! 🎓**
