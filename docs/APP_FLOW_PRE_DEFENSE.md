# PCOS Health Tracker - Complete App Flow
## Pre-Defense Quick Reference

---

## 🎯 SIMPLE 3-SENTENCE EXPLANATION

"PCOS Health Tracker is a mobile app where women can track their period, mood, sleep, and symptoms all in one place. The app analyzes this data to find patterns like how sleep affects mood, and uses AI to answer health questions. Users can export their data as PDF to share with doctors."

---

## 📱 COMPLETE USER JOURNEY (Step-by-Step)

### 1️⃣ ONBOARDING FLOW (First Time User)

**Step 1: User Opens App**
- Sees welcome/splash screen
- Two options: Login or Register

**Step 2: Registration**
- User enters: Name, Email, Password
- Frontend validates input (email format, password strength)
- Frontend sends POST request to `/api/auth/register`
- Backend:
  - Checks if email already exists
  - Hashes password with bcrypt
  - Saves user to MongoDB
  - Creates JWT token
  - Returns token + user data
- Frontend stores token in AsyncStorage
- User is logged in automatically

**Step 3: Login (Returning Users)**
- User enters: Email, Password
- Frontend sends POST request to `/api/auth/login`
- Backend:
  - Finds user by email
  - Compares password with bcrypt
  - Creates JWT token
  - Returns token + user data
- Frontend stores token
- User is logged in

---

### 2️⃣ HOME DASHBOARD (Main Screen)

**What User Sees:**
- Welcome message with their name
- Quick action buttons:
  - Track Period
  - Track Mood
  - Track Sleep
  - Track Symptoms
- Today's summary (if data exists)
- Navigation to other features

**Behind the Scenes:**
- Frontend loads user data from AsyncStorage
- Makes API calls to get today's data
- Displays summary cards

---

### 3️⃣ PERIOD TRACKING FLOW

**User Journey:**
1. User clicks "Track Period" button
2. Sees interactive calendar
3. Selects date (today or past date)
4. Chooses flow intensity: Light, Medium, or Heavy
5. Clicks "Save"

**Technical Flow:**
```
Frontend (PeriodTrackingScreen)
    ↓ User fills form
    ↓ Clicks Save
    ↓ Calls periodService.createPeriod()
    ↓
Frontend Service (periodService.ts)
    ↓ Prepares data: { date, flow, userId }
    ↓ Adds JWT token to headers
    ↓ POST /api/periods
    ↓
Backend (period.routes.ts)
    ↓ Receives request
    ↓ Auth middleware checks JWT token
    ↓ Calls periodController.createPeriod()
    ↓
Backend Controller (period.controller.ts)
    ↓ Validates data
    ↓ Calls periodService.createPeriod()
    ↓
Backend Service (period.service.ts)
    ↓ Creates Period document
    ↓ Saves to MongoDB
    ↓ Returns saved period
    ↓
Backend sends response back
    ↓
Frontend receives success
    ↓ Shows success message
    ↓ Updates calendar view
    ↓ Runs prediction algorithm
```

**Period Prediction Algorithm:**
- Gets last 3-6 periods from database
- Calculates average cycle length
- Predicts next period date
- Shows prediction on calendar in light color

---

### 4️⃣ MOOD TRACKING FLOW

**User Journey:**
1. User clicks "Track Mood"
2. Selects mood level (1-5): Terrible → Bad → Okay → Good → Great
3. Selects factors affecting mood:
   - Stress, Exercise, Diet, Sleep, Social, Work
4. Optionally adds notes
5. Clicks "Save"

**Technical Flow:**
```
Frontend → POST /api/moods
    Body: {
        moodLevel: 4,
        factors: ['sleep', 'exercise'],
        notes: 'Feeling great today!',
        date: '2024-03-30'
    }
    Headers: { Authorization: 'Bearer JWT_TOKEN' }
    ↓
Backend → Auth Middleware
    ↓ Verifies JWT token
    ↓ Extracts userId from token
    ↓
Backend → Mood Controller
    ↓ Validates data
    ↓ Calls mood service
    ↓
Backend → Mood Service
    ↓ Creates mood document with userId
    ↓ Saves to MongoDB moods collection
    ↓
Backend → Response
    ↓ Returns saved mood data
    ↓
Frontend → Updates UI
    ↓ Shows success message
    ↓ Redirects to mood history
```

---

### 5️⃣ SLEEP TRACKING FLOW

**User Journey:**
1. User clicks "Track Sleep"
2. Enters bedtime (e.g., 11:00 PM)
3. Enters wake time (e.g., 7:00 AM)
4. Rates sleep quality (1-5 stars)
5. Optionally selects factors (Stress, Exercise, etc.)
6. Clicks "Save"

**Backend Calculation:**
- Calculates sleep duration automatically
- Example: 11 PM to 7 AM = 8 hours
- Stores: bedtime, wakeTime, duration, quality, factors

---

### 6️⃣ SYMPTOM TRACKING FLOW

**User Journey:**
1. User clicks "Track Symptoms"
2. Sees 16 PCOS-specific symptoms in 3 categories:
   - **Physical:** Acne, Hair Loss, Weight Gain, Fatigue
   - **Hormonal:** Irregular Periods, Mood Swings, Anxiety
   - **Metabolic:** Insulin Resistance, High Blood Sugar
3. Selects symptoms they're experiencing
4. Sets severity for each: Mild, Moderate, Severe
5. Clicks "Save"

**Data Structure:**
```javascript
{
    userId: "user123",
    symptoms: [
        { name: "Acne", severity: "Moderate", category: "Physical" },
        { name: "Fatigue", severity: "Severe", category: "Physical" }
    ],
    date: "2024-03-30"
}
```

---

### 7️⃣ SMART INSIGHTS FLOW (The Magic!)

**User Journey:**
1. User clicks "Insights" or "Smart Alerts"
2. Sees analysis dashboard with:
   - Mood-Sleep Correlation
   - Period-Mood Patterns
   - Health Risk Assessment
   - Personalized Recommendations

**Technical Flow:**
```
Frontend → GET /api/insights
    ↓
Backend → Insights Service
    ↓ Gets last 30 days of data:
        - All mood entries
        - All sleep entries
        - All period entries
        - All symptoms
    ↓
Backend → Analysis Algorithms
    ↓
    1. MOOD-SLEEP CORRELATION
       - Matches mood and sleep by date
       - Calculates Pearson correlation
       - Result: "Strong positive correlation (0.75)"
       - Insight: "Your mood improves with 7-9 hours sleep"
    
    2. PERIOD-MOOD PATTERN
       - Finds mood entries 3 days before period
       - Calculates average mood during that time
       - Result: "Mood drops 3 days before period"
       - Insight: "PMS symptoms detected"
    
    3. HEALTH RISK ASSESSMENT
       - Counts severe symptoms: 3
       - Counts moderate symptoms: 5
       - Calculates risk level
       - Result: "Moderate Risk"
       - Recommendation: "Consider consulting doctor"
    ↓
Backend → Returns insights object
    ↓
Frontend → Displays with visual indicators
    - Green = Good correlation
    - Yellow = Moderate
    - Red = Needs attention
```

---

### 8️⃣ AI CHATBOT FLOW (Google Gemini)

**User Journey:**
1. User clicks "AI Assistant" or chatbot icon
2. Types question: "Why am I feeling tired lately?"
3. Waits 3-5 seconds
4. Receives personalized answer

**Technical Flow:**
```
Frontend → User types message
    ↓ Calls chatbotService.sendMessage()
    ↓ POST /api/ai/chat
    Body: { message: "Why am I feeling tired?" }
    ↓
Backend → AI Controller
    ↓ Gets user's recent health data:
        - Last 7 days mood logs
        - Last 7 days sleep logs
        - Recent symptoms
        - Period cycle info
    ↓
Backend → Builds AI Prompt
    Prompt: "You are a PCOS health assistant.
    
    User's question: Why am I feeling tired lately?
    
    User's recent data:
    - Sleep: 5 hours/night (last 7 days)
    - Mood: Low (2-3/5)
    - Symptoms: Fatigue, mood swings
    - Period: Due in 3 days
    
    Provide helpful, empathetic response."
    ↓
Backend → AI Service (ai.service.ts)
    ↓ Calls Google Gemini API
    ↓ POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
    ↓
Google Gemini AI
    ↓ Analyzes prompt + user data
    ↓ Generates personalized response
    ↓ Returns text
    ↓
Backend → Receives AI response
    ↓ Returns to frontend
    ↓
Frontend → Displays in chat interface
    Shows: "Based on your recent data, your fatigue 
    could be related to insufficient sleep (5 hours vs 
    recommended 7-9 hours) and upcoming period..."
```

---

### 9️⃣ DATA EXPORT FLOW

**User Journey:**
1. User clicks "Export Data"
2. Selects date range (e.g., Last 30 days)
3. Chooses format: PDF or CSV
4. Clicks "Generate Report"
5. Receives downloadable file

**Technical Flow:**
```
Frontend → POST /api/export
    Body: {
        startDate: "2024-03-01",
        endDate: "2024-03-30",
        format: "pdf"
    }
    ↓
Backend → Export Service
    ↓ Queries all data in date range:
        - Periods
        - Moods
        - Sleep
        - Symptoms
    ↓
Backend → Generates PDF/CSV
    ↓ Formats data into readable report
    ↓ Includes charts and summaries
    ↓
Backend → Returns file
    ↓
Frontend → Downloads file
    ↓ User can share with doctor
```

---

### 🔟 REMINDER SYSTEM FLOW

**User Journey:**
1. User clicks "Reminders"
2. Clicks "+" to add new reminder
3. Fills form:
   - Type: Medication/Supplement/Food
   - Name: "Vitamin D"
   - Time: "8:00 AM"
   - Days: Select days of week
4. Clicks "Save"

**Technical Flow:**
```
Frontend → POST /api/reminders
    ↓
Backend → Saves reminder to database
    ↓
Backend → Schedules notification
    ↓ Uses Expo Push Notifications
    ↓ Sets up recurring notification
    ↓
At 8:00 AM daily:
    ↓ Expo sends push notification
    ↓ User's phone shows alert
    ↓ "Time to take Vitamin D"
```

---

## 🔄 DATA FLOW SUMMARY

### Simple Version:
```
User Action → Frontend → Backend API → Database → Backend → Frontend → User Sees Result
```

### Detailed Version:
```
1. User interacts with app (clicks button, fills form)
2. Frontend validates input
3. Frontend calls service function (e.g., moodService.createMood())
4. Service adds JWT token to request headers
5. Service sends HTTP request to backend API
6. Backend receives request
7. Auth middleware verifies JWT token
8. Controller receives request
9. Controller validates data
10. Controller calls service function
11. Service interacts with database (MongoDB)
12. Database saves/retrieves data
13. Service returns data to controller
14. Controller sends response to frontend
15. Frontend receives response
16. Frontend updates UI
17. User sees result
```

---

## 🔐 AUTHENTICATION FLOW (How Security Works)

### Registration:
```
User enters password: "mypassword123"
    ↓
Frontend sends to backend
    ↓
Backend hashes with bcrypt:
    Original: "mypassword123"
    Hashed: "$2b$10$xYz123...abc789" (60 characters)
    ↓
Backend saves hashed password to database
    ↓
Backend creates JWT token:
    Token contains: { userId, email, exp: 24h }
    Signed with secret key
    ↓
Backend returns token to frontend
    ↓
Frontend stores token in AsyncStorage
```

### Every API Request:
```
Frontend adds token to headers:
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    ↓
Backend auth middleware:
    1. Extracts token from header
    2. Verifies token signature
    3. Checks if expired
    4. Extracts userId from token
    5. Attaches userId to request
    ↓
If valid: Request continues
If invalid: Returns 401 Unauthorized
```

---

## 📊 KEY ALGORITHMS EXPLAINED

### 1. Period Prediction Algorithm
```javascript
function predictNextPeriod(previousPeriods) {
    // Get last 3-6 periods
    const periods = previousPeriods.slice(-6);
    
    // Calculate cycle lengths
    const cycleLengths = [];
    for (let i = 1; i < periods.length; i++) {
        const days = daysBetween(periods[i-1].date, periods[i].date);
        cycleLengths.push(days);
    }
    
    // Calculate average
    const avgCycle = average(cycleLengths);
    
    // Predict next period
    const lastPeriod = periods[periods.length - 1];
    const nextPeriod = addDays(lastPeriod.date, avgCycle);
    
    return nextPeriod;
}
```

### 2. Mood-Sleep Correlation
```javascript
function calculateMoodSleepCorrelation(moods, sleeps) {
    // Match mood and sleep by date
    const pairs = matchByDate(moods, sleeps);
    
    // Extract values
    const moodValues = pairs.map(p => p.mood.level);
    const sleepValues = pairs.map(p => p.sleep.hours);
    
    // Calculate Pearson correlation
    const correlation = pearsonCorrelation(moodValues, sleepValues);
    
    // Interpret result
    if (correlation > 0.7) return "Strong positive";
    if (correlation > 0.4) return "Moderate positive";
    return "Weak or no correlation";
}
```

### 3. Health Risk Assessment
```javascript
function assessHealthRisk(symptoms) {
    const severeCount = symptoms.filter(s => s.severity === 'Severe').length;
    const moderateCount = symptoms.filter(s => s.severity === 'Moderate').length;
    
    if (severeCount >= 3) return "High Risk";
    if (severeCount >= 1 || moderateCount >= 5) return "Moderate Risk";
    return "Low Risk";
}
```

---

## 🎤 HOW TO EXPLAIN IN PRESENTATION

### Opening (30 seconds):
"Let me walk you through how the app works. A user starts by registering with their email and password. The password is securely hashed and a JWT token is created for authentication."

### Main Flow (2 minutes):
"Once logged in, users see the home dashboard with quick actions. They can track their period by selecting dates and flow intensity on a calendar. The app uses an algorithm to predict the next period based on their cycle history.

For mood tracking, users select a mood level and factors like sleep or stress. Similarly, they can log sleep duration and quality. All this data is sent to the backend API, validated, and stored in MongoDB.

The smart insights feature is where it gets interesting. The app analyzes 30 days of data to find correlations. For example, it calculates if better sleep leads to better mood using statistical correlation. It also detects patterns like mood drops before periods.

The AI chatbot uses Google Gemini AI. When a user asks a question, the backend gathers their recent health data and sends it to Gemini along with the question. Gemini provides a personalized, context-aware response based on their actual data.

Finally, users can export all their data as PDF or CSV to share with doctors."

### Technical Highlight (30 seconds):
"The architecture follows a three-tier model with React Native frontend, Node.js backend, and MongoDB database. I implemented JWT authentication for security, and used an adapter pattern for the AI service, allowing easy switching between AI providers."

---

## ❓ EXPECTED QUESTIONS & ANSWERS

**Q: How does the app ensure data privacy?**
A: Each user's data is isolated by userId. JWT tokens ensure only authenticated users access their own data. Passwords are hashed with bcrypt and never stored in plain text.

**Q: What happens if the user is offline?**
A: Currently, the app requires internet connection. For future versions, I plan to implement offline-first architecture with local storage and sync when online.

**Q: How accurate is the period prediction?**
A: The algorithm calculates average cycle length from the last 3-6 periods. For regular cycles, it's quite accurate. For irregular cycles common in PCOS, it provides a date range instead of exact date.

**Q: How do you handle AI response time?**
A: Gemini AI typically responds in 3-5 seconds. I show a loading indicator during this time. For future optimization, I could implement response streaming or caching for common questions.

**Q: Can users track multiple symptoms at once?**
A: Yes, users can select multiple symptoms from 16 PCOS-specific symptoms across 3 categories, and set individual severity levels for each.

---

## ✅ FINAL CHECKLIST

Before presenting, make sure you can explain:
- [ ] How user registration works (password hashing, JWT)
- [ ] How data flows from frontend to database
- [ ] How period prediction algorithm works
- [ ] How AI chatbot gets personalized context
- [ ] How smart insights calculate correlations
- [ ] Why you chose each technology
- [ ] How security is implemented
- [ ] What happens when user clicks "Save"

---

**You've got this! The flow is logical and well-implemented. Good luck! 🎉**
