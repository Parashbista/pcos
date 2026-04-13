# PCOS Tracker - Quick Reference Cheat Sheet

## 🎯 30-Second Explanation

"My app is a health tracker for PCOS patients. Users track periods, mood, sleep, and symptoms on their phone. The data goes to my Node.js backend, gets saved in MongoDB, and AI analyzes it to give personalized insights."

---

## 📊 App Structure in 3 Parts

```
┌─────────────────────────────────────────┐
│  PHONE APP (React Native)              │
│  - 28 screens users interact with      │
│  - Sends data to backend via API       │
└─────────────────────────────────────────┘
              ↕ Internet
┌─────────────────────────────────────────┐
│  BACKEND SERVER (Node.js + Express)    │
│  - Handles requests                     │
│  - Runs algorithms                      │
│  - Talks to database                    │
└─────────────────────────────────────────┘
              ↕ Database Queries
┌─────────────────────────────────────────┐
│  DATABASE (MongoDB Atlas - Cloud)      │
│  - Stores all user data permanently    │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Simple Example

**User logs mood:**
```
1. User clicks "Track Mood" on phone
2. User selects mood level (1-5)
3. Phone sends to backend: POST /api/moods
4. Backend checks: Is user logged in? ✓
5. Backend saves to MongoDB
6. Backend responds: "Success!"
7. Phone shows: "Mood saved!"
```

---

## 🔐 How Login Works

**Registration:**
```
User enters: email + password
↓
Backend hashes password (makes it unreadable)
↓
Saves to database
↓
Creates JWT token (like a digital key)
↓
Sends token to phone
↓
Phone stores token
↓
User is logged in!
```

**Every API Call After Login:**
```
Phone sends: "Here's my token"
Backend checks: "Token valid? Yes → Allow access"
```

---

## 🗂️ File Structure - What's Where

### Frontend (Phone App)
```
frontend/my-expo-app/
├── screens/          → Pages users see
├── navigation/       → How pages connect
├── services/         → API call functions
└── constants/        → Colors, styles
```

### Backend (Server)
```
backend/src/
├── routes/           → URLs (/api/moods, etc.)
├── controllers/      → Handle requests
├── services/         → Business logic
├── models/           → Database structure
└── middleware/       → Security checks
```

---

## 🎨 Key Technologies

| Technology | Purpose | Where Used |
|------------|---------|------------|
| React Native | Build mobile app | Frontend |
| TypeScript | Type-safe JavaScript | Frontend |
| Node.js | Run JavaScript on server | Backend |
| Express | Handle HTTP requests | Backend |
| MongoDB | Store data | Database |
| JWT | Authentication | Backend |
| bcrypt | Hash passwords | Backend |
| Gemini AI | Chatbot responses | Backend |
| Axios | Make API calls | Frontend |

---

## 🔌 API Endpoints Quick Reference

### Authentication
```
POST /api/auth/register    → Create account
POST /api/auth/login       → Login
POST /api/auth/forgot-password → Reset password
```

### Health Tracking
```
GET  /api/moods           → Get all moods
POST /api/moods           → Save new mood
GET  /api/periods         → Get period history
POST /api/periods         → Log period
GET  /api/sleep           → Get sleep logs
POST /api/sleep           → Log sleep
GET  /api/symptoms        → Get symptoms
POST /api/symptoms        → Log symptoms
```

### AI & Insights
```
POST /api/ai/chat         → Chat with AI
GET  /api/insights        → Get smart insights
```

---

## 🤖 How AI Chatbot Works

```
User asks: "Why am I tired?"
↓
Backend gets user's recent data:
  - Sleep: 5 hours/night
  - Mood: Low
  - Symptoms: Fatigue
↓
Backend sends to Google Gemini AI:
  "User question + User's health data"
↓
AI analyzes and responds:
  "You're sleeping only 5 hours..."
↓
Response shown to user
```

---

## 📊 Smart Insights Algorithms

### 1. Mood-Sleep Correlation
```
Get last 30 days of mood + sleep
Compare: More sleep = Better mood?
Calculate correlation score
Show result: "Strong correlation found!"
```

### 2. Period Prediction
```
Get last 3 periods
Calculate average cycle length
Add to last period end date
Show predicted date on calendar
```

### 3. Health Risk Assessment
```
Count severe symptoms in last 7 days
3+ severe → HIGH RISK
1-2 severe → MODERATE RISK
0 severe → LOW RISK
```

---

## 💾 Database Collections

```
users
├── _id
├── name
├── email
├── password (hashed)
└── profilePhoto

moods
├── _id
├── userId (links to user)
├── moodLevel (1-5)
├── factors []
└── date

periods
├── _id
├── userId
├── startDate
├── endDate
└── flowIntensity

symptoms
├── _id
├── userId
├── symptoms []
└── date
```

---

## 🔒 Security Features

✓ **Password Hashing:** bcrypt (10 rounds)
✓ **Authentication:** JWT tokens
✓ **Authorization:** Middleware checks on every request
✓ **Data Isolation:** Users only see their own data
✓ **CORS Protection:** Only allowed origins
✓ **Environment Variables:** Secrets not in code

---

## 🎯 Main Features Checklist

✅ User Registration & Login
✅ Period Tracking with Calendar
✅ Mood Tracking with Factors
✅ Sleep Tracking with Quality
✅ Symptom Tracking (16 PCOS symptoms)
✅ Smart Insights & Correlations
✅ AI Chatbot (Google Gemini)
✅ Moodboard with Images
✅ Partner Sharing with Access Codes
✅ Data Export (PDF/CSV)
✅ Medication Reminders
✅ Push Notifications
✅ Profile Management
✅ Settings & Preferences

---

## 🚀 How to Run

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend/my-expo-app
npm install
npm start
# Scan QR code with Expo Go app
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Can't connect to server | Check backend is running, use correct IP |
| Unauthorized error | Login again, token expired |
| Validation error | Check required fields are filled |
| App crashes | Check console for errors, restart Expo |

---

## 📱 Demo Flow for Presentation

1. **Show Login** (10 sec)
   - Enter credentials → Login

2. **Home Dashboard** (15 sec)
   - Show today's summary
   - Quick action buttons

3. **Track Mood** (20 sec)
   - Select mood level
   - Choose factors
   - Save

4. **View Insights** (30 sec)
   - Mood-sleep correlation
   - Health risk level
   - Recommendations

5. **AI Chatbot** (30 sec)
   - Ask: "Why am I feeling tired?"
   - Show AI response

6. **Export Data** (15 sec)
   - Select date range
   - Export as PDF

**Total: 2 minutes**

---

## 💡 Key Points for Questions

**Q: Why React Native?**
A: Cross-platform (iOS + Android), single codebase, large community

**Q: Why MongoDB?**
A: Flexible schema, cloud-hosted (Atlas), good for health data

**Q: How secure is it?**
A: Passwords hashed, JWT auth, user data isolated, CORS protection

**Q: How does AI work?**
A: Google Gemini API with user's health data as context

**Q: Can it work offline?**
A: Currently needs internet, offline mode is future enhancement

---

## 🎓 Technical Terms Explained

**JWT:** JSON Web Token - like a digital ID card
**API:** Application Programming Interface - how frontend talks to backend
**REST:** Representational State Transfer - standard way to design APIs
**CRUD:** Create, Read, Update, Delete - basic database operations
**Async/Await:** Wait for operations to complete before continuing
**Middleware:** Code that runs before main function (like security check)
**Schema:** Structure/rules for how data should look
**Hash:** Convert password to unreadable string
**Token:** Encrypted string that proves user identity

---

## 📈 Project Stats

- **28 Screens** implemented
- **9 API Routes** with full CRUD
- **8 Database Collections**
- **5 External Services** (MongoDB, Gemini AI, Email, Notifications)
- **10+ Algorithms** (predictions, correlations, risk assessment)
- **100+ API Endpoints** total
- **2000+ Lines** of backend code
- **3000+ Lines** of frontend code

---

## 🎯 One-Liner Explanations

**Frontend:** "The app users see and touch on their phone"
**Backend:** "The server that handles logic and saves data"
**Database:** "Where all data is stored permanently"
**API:** "How frontend and backend talk to each other"
**JWT:** "Digital key that proves you're logged in"
**Model:** "Rules for what data should look like"
**Controller:** "Function that handles a specific request"
**Service:** "Where business logic and algorithms live"
**Route:** "URL that frontend can call"
**Middleware:** "Security guard that checks requests"

---

## 🎤 Elevator Pitch (30 seconds)

"I built a PCOS health tracking app using React Native and Node.js. Women can track their periods, mood, sleep, and symptoms on their phone. The app uses AI to analyze patterns and provide personalized insights. All data is securely stored in MongoDB with JWT authentication. Users can share data with doctors and export reports. It's a complete solution for PCOS management."

---

## ✅ Pre-Defense Checklist

Before presentation:
- [ ] Backend running
- [ ] Frontend running on phone
- [ ] Test user account created
- [ ] Sample data logged
- [ ] Presentation slides ready
- [ ] Demo flow practiced
- [ ] Backup plan if internet fails
- [ ] Questions & answers prepared

---

**Good luck! You've got this! 🚀**
