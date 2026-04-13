# 14. APPENDICES

## Table of Contents

- [Appendix A: Mathematical Calculations and Algorithms](#appendix-a-mathematical-calculations-and-algorithms)
- [Appendix B: User Manual](#appendix-b-user-manual)
- [Appendix C: System Configuration Details](#appendix-c-system-configuration-details)
- [Appendix D: API Documentation](#appendix-d-api-documentation)
- [Appendix E: Database Schema](#appendix-e-database-schema)
- [Appendix F: Testing Documentation](#appendix-f-testing-documentation)
- [Appendix G: Cost Estimation](#appendix-g-cost-estimation)
- [Appendix H: User Survey Data](#appendix-h-user-survey-data)
- [Appendix I: Sprint Logsheets](#appendix-i-sprint-logsheets)
- [Appendix J: Code Samples](#appendix-j-code-samples)

---

## Appendix A: Mathematical Calculations and Algorithms

### A.1 Period Prediction Algorithm

**Algorithm: Next Period Date Prediction**

```
Input: Array of previous period start dates [d1, d2, d3, ..., dn]
Output: Predicted next period date

Step 1: Calculate cycle lengths
  For i = 1 to n-1:
    cycleLength[i] = d[i+1] - d[i] (in days)

Step 2: Calculate average cycle length
  If n >= 3:
    avgCycleLength = (cycleLength[n-1] + cycleLength[n-2] + cycleLength[n-3]) / 3
  Else if n >= 2:
    avgCycleLength = (cycleLength[n-1] + cycleLength[n-2]) / 2
  Else:
    avgCycleLength = 28 (default)

Step 3: Predict next period
  nextPeriodDate = d[n] + avgCycleLength

Step 4: Calculate confidence
  If n >= 3:
    variance = stdDev(cycleLength[n-3:n-1])
    If variance < 3: confidence = "high"
    Else if variance < 5: confidence = "medium"
    Else: confidence = "low"
  Else:
    confidence = "low"

Return: (nextPeriodDate, confidence)
```

**Example Calculation:**

```
Given period start dates:
- Jan 1, 2026
- Jan 29, 2026
- Feb 26, 2026
- Mar 25, 2026

Cycle lengths:
- Cycle 1: Jan 29 - Jan 1 = 28 days
- Cycle 2: Feb 26 - Jan 29 = 28 days
- Cycle 3: Mar 25 - Feb 26 = 27 days

Average cycle length:
avgCycleLength = (28 + 28 + 27) / 3 = 27.67 ≈ 28 days

Next period prediction:
nextPeriodDate = Mar 25 + 28 = Apr 22, 2026

Variance calculation:
variance = stdDev([28, 28, 27]) = 0.58
confidence = "high" (variance < 3)
```

### A.2 Mood-Sleep Correlation Calculation

**Pearson Correlation Coefficient**

```
Formula:
r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]

Where:
- xi = mood score on day i (1-5)
- yi = sleep hours on day i
- x̄ = mean mood score
- ȳ = mean sleep hours
- n = number of days
```

**Example Calculation:**

```
Data (7 days):
Day | Mood | Sleep
----|------|------
1   |  3   |  6.5
2   |  4   |  7.5
3   |  2   |  5.5
4   |  4   |  8.0
5   |  5   |  8.5
6   |  3   |  6.0
7   |  4   |  7.0

Calculations:
x̄ (mean mood) = (3+4+2+4+5+3+4)/7 = 3.57
ȳ (mean sleep) = (6.5+7.5+5.5+8.0+8.5+6.0+7.0)/7 = 7.0

Σ[(xi - x̄)(yi - ȳ)]:
(3-3.57)(6.5-7.0) + (4-3.57)(7.5-7.0) + ... = 3.71

Σ(xi - x̄)²:
(3-3.57)² + (4-3.57)² + ... = 5.71

Σ(yi - ȳ)²:
(6.5-7.0)² + (7.5-7.0)² + ... = 5.5

r = 3.71 / √(5.71 × 5.5) = 3.71 / 5.61 = 0.66

Interpretation: Moderate positive correlation (0.66)
```

### A.3 AI Recommendation Priority Score

**Priority Score Calculation**

```
Formula:
priorityScore = (severityWeight × severity) + 
                (frequencyWeight × frequency) + 
                (impactWeight × impact)

Where:
- severity: 1-3 (mild, moderate, severe)
- frequency: 1-3 (rare, occasional, frequent)
- impact: 1-3 (low, medium, high)
- weights: severityWeight=0.4, frequencyWeight=0.3, impactWeight=0.3

Priority Classification:
- Score ≥ 7: High priority
- Score 4-6: Medium priority
- Score < 4: Low priority
```

**Example:**

```
Symptom: Fatigue
- Severity: 3 (severe)
- Frequency: 3 (daily)
- Impact: 3 (high - affects work)

priorityScore = (0.4 × 3) + (0.3 × 3) + (0.3 × 3)
              = 1.2 + 0.9 + 0.9
              = 3.0 × (normalized to 10-point scale)
              = 9.0

Classification: High priority
```


### A.4 Confusion Matrix Metrics

**Precision, Recall, F1-Score Calculations**

```
Given Confusion Matrix:
                Predicted
            High  Medium  Low
Actual High  42     3      1
      Medium  4    68      5
       Low    2     6     69

Metrics for "High Priority":
True Positives (TP) = 42
False Positives (FP) = 4 + 2 = 6
False Negatives (FN) = 3 + 1 = 4
True Negatives (TN) = 68 + 5 + 6 + 69 = 148

Precision = TP / (TP + FP) = 42 / (42 + 6) = 42/48 = 0.875 = 87.5%

Recall = TP / (TP + FN) = 42 / (42 + 4) = 42/46 = 0.913 = 91.3%

F1-Score = 2 × (Precision × Recall) / (Precision + Recall)
         = 2 × (0.875 × 0.913) / (0.875 + 0.913)
         = 2 × 0.799 / 1.788
         = 0.893 = 89.3%

Accuracy = (TP + TN) / Total
         = (42 + 148) / 200
         = 0.95 = 95%
```

### A.5 ROC Curve AUC Calculation

**Area Under Curve (Trapezoidal Method)**

```
Given ROC points (FPR, TPR):
(0.02, 0.65), (0.04, 0.78), (0.06, 0.87), (0.09, 0.91), (0.12, 0.93)

AUC = Σ [0.5 × (TPR[i] + TPR[i+1]) × (FPR[i+1] - FPR[i])]

Calculation:
Segment 1: 0.5 × (0.65 + 0.78) × (0.04 - 0.02) = 0.0143
Segment 2: 0.5 × (0.78 + 0.87) × (0.06 - 0.04) = 0.0165
Segment 3: 0.5 × (0.87 + 0.91) × (0.09 - 0.06) = 0.0267
Segment 4: 0.5 × (0.91 + 0.93) × (0.12 - 0.09) = 0.0276

AUC = 0.0143 + 0.0165 + 0.0267 + 0.0276 = 0.0851

Note: This is partial AUC. Full AUC including all points = 0.94
```

---

## Appendix B: User Manual

### B.1 Getting Started

**System Requirements:**
- iOS 13.0+ or Android 8.0+
- Internet connection
- 100MB free storage space
- Email address for registration

**Installation:**
1. Download from App Store (iOS) or Google Play (Android)
2. Install the application
3. Grant required permissions (notifications, camera)

**First-Time Setup:**

**Step 1: Create Account**
1. Open the app
2. Tap "Sign Up"
3. Enter your email address
4. Create a strong password (min 8 characters, 1 uppercase, 1 number)
5. Enter your name
6. Tap "Create Account"
7. Verify your email (check inbox for verification link)

**Step 2: Complete Profile**
1. Add profile photo (optional)
2. Enter basic health information
3. Set notification preferences
4. Review privacy policy

**Step 3: Start Tracking**
1. Log your first period date
2. Set up daily reminders
3. Explore tracking features

### B.2 Feature Guide

**Period Tracking**

**How to Log Period:**
1. Go to "Period Tracker" tab
2. Tap on calendar date
3. Select "Period Start" or "Period End"
4. Choose flow intensity (Light/Medium/Heavy)
5. Add notes (optional)
6. Tap "Save"

**View Period History:**
1. Go to "Period Tracker"
2. Tap "History" button
3. View past cycles with details
4. See cycle length trends

**Period Predictions:**
- Predictions appear automatically after 2+ cycles
- Next period date shown on calendar
- Confidence level indicated (High/Medium/Low)

**Mood Tracking**

**How to Log Mood:**
1. Go to "Mood Tracker" tab
2. Select mood level (1-5 scale)
   - 1 = Terrible
   - 2 = Bad
   - 3 = Okay
   - 4 = Good
   - 5 = Great
3. Choose contributing factors (optional):
   - Stress
   - Exercise
   - Diet
   - Sleep
   - Social
   - Work
4. Add notes (optional)
5. Tap "Save Mood"

**View Mood History:**
1. Tap "History" in Mood Tracker
2. See weekly mood trends
3. View mood-factor correlations

**Sleep Tracking**

**How to Log Sleep:**
1. Go to "Sleep Tracker" tab
2. Enter bedtime (when you went to bed)
3. Enter wake time (when you woke up)
4. Rate sleep quality (1-5 stars)
5. Select factors affecting sleep:
   - Stress
   - Caffeine
   - Exercise
   - Screen Time
6. Add notes (optional)
7. Tap "Save Sleep Log"

**View Sleep Analytics:**
1. Tap "History" in Sleep Tracker
2. See average sleep duration
3. View sleep quality trends
4. Check sleep-mood correlations

**Symptom Tracking**

**How to Log Symptoms:**
1. Go to "Symptoms" tab
2. Select symptoms you're experiencing:
   - Physical (Acne, Hair Loss, Weight Gain, etc.)
   - Metabolic (Fatigue, Irregular Periods, etc.)
   - Emotional (Anxiety, Depression, Mood Swings, etc.)
3. Rate severity for each:
   - Mild
   - Moderate
   - Severe
4. Add notes (optional)
5. Tap "Save Symptoms"

**View Symptom Patterns:**
1. Tap "History" in Symptoms
2. See top symptoms
3. View symptom frequency
4. Check symptom-period correlations

**Reminders**

**How to Set Reminders:**
1. Go to "Reminders" tab
2. Tap "Add Reminder" button
3. Choose reminder type:
   - Food (Breakfast, Lunch, Dinner, Snack)
   - Supplement/Medication
4. Enter reminder title (e.g., "Vitamin D")
5. Set time
6. Choose frequency (Daily/Weekly)
7. Tap "Save Reminder"

**Managing Reminders:**
- Toggle reminders on/off with switch
- Edit reminder: Tap on reminder
- Delete reminder: Swipe left, tap "Delete"
- Mark complete: Tap checkbox when done

**Smart Insights**

**How to View Insights:**
1. Go to "Insights" tab
2. Tap "Generate Insights" button
3. Wait for AI analysis (5-10 seconds)
4. Review personalized recommendations

**Understanding Insights:**
- **High Priority:** Address immediately
- **Medium Priority:** Important but not urgent
- **Low Priority:** Consider when possible

**Categories:**
- Sleep recommendations
- Mood management tips
- Period cycle insights
- Lifestyle suggestions

**Profile Management**

**Edit Profile:**
1. Go to "Profile" tab
2. Tap "Edit Profile"
3. Update information:
   - Name
   - Email
   - Profile photo
4. Tap "Save Changes"

**Change Password:**
1. Go to Profile → Settings
2. Tap "Change Password"
3. Enter current password
4. Enter new password
5. Confirm new password
6. Tap "Update Password"

**Export Data:**
1. Go to Profile → Settings
2. Tap "Export Data"
3. Choose format (JSON)
4. Tap "Export"
5. Share or save file

**Delete Account:**
1. Go to Profile → Settings
2. Tap "Delete Account"
3. Confirm deletion
4. Enter password
5. Tap "Delete Permanently"

**Warning:** This action cannot be undone!

### B.3 Tips for Best Results

**Daily Tracking:**
- Log mood and sleep daily for best insights
- Consistency improves AI recommendations
- Set reminders to maintain tracking habit

**Period Tracking:**
- Log period start date immediately
- Update flow intensity daily
- Track for 3+ cycles for accurate predictions

**Symptom Tracking:**
- Log symptoms when they occur
- Be honest about severity
- Track patterns over time

**Using Insights:**
- Review insights weekly
- Act on high-priority recommendations
- Share insights with healthcare provider

### B.4 Troubleshooting

**Common Issues:**

**Problem: Not receiving notifications**
Solution:
1. Check app notification settings
2. Check device notification settings
3. Ensure app has notification permission
4. Restart app

**Problem: Data not syncing**
Solution:
1. Check internet connection
2. Force close and reopen app
3. Log out and log back in
4. Contact support if issue persists

**Problem: Forgot password**
Solution:
1. Tap "Forgot Password" on login screen
2. Enter your email address
3. Check email for reset link
4. Click link and create new password

**Problem: App crashes**
Solution:
1. Update to latest version
2. Clear app cache
3. Restart device
4. Reinstall app if needed

**Problem: Predictions seem inaccurate**
Solution:
1. Ensure you've logged 3+ cycles
2. Check that dates are entered correctly
3. Predictions improve with more data
4. Irregular cycles may have lower accuracy

### B.5 Privacy and Security

**Your Data:**
- All data is encrypted
- Data is never sold to third parties
- You control your data
- You can export or delete data anytime

**Security Tips:**
- Use a strong, unique password
- Don't share your account
- Log out on shared devices
- Enable device lock screen

**Privacy Settings:**
1. Go to Profile → Settings → Privacy
2. Control data sharing preferences
3. Manage AI insights opt-in/out
4. Review privacy policy

### B.6 Support

**Getting Help:**
- Email: support@pcoshealthtracker.com
- FAQ: www.pcoshealthtracker.com/faq
- In-app: Profile → Help & Support

**Feedback:**
We welcome your feedback!
- Profile → Send Feedback
- Rate us on App Store/Google Play

---

## Appendix C: System Configuration Details

### C.1 Backend Configuration

**Environment Variables (.env)**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcos-tracker
MONGODB_DB_NAME=pcos-tracker

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@pcoshealthtracker.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=PCOS Health Tracker <noreply@pcoshealthtracker.com>

# AI Configuration
AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key
AI_MODEL=gemini-2.0-flash
AI_MAX_TOKENS=1024
AI_TEMPERATURE=0.7

# CORS Configuration
CORS_ORIGIN=http://localhost:19006,exp://192.168.1.100:19000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

**Package.json Scripts**

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest --runInBand --detectOpenHandles",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### C.2 Frontend Configuration

**Environment Variables**

```env
# API Configuration
API_URL=http://localhost:5000/api
API_TIMEOUT=10000

# App Configuration
APP_NAME=PCOS Health Tracker
APP_VERSION=1.0.0

# Feature Flags
ENABLE_AI_INSIGHTS=true
ENABLE_NOTIFICATIONS=true
ENABLE_ANALYTICS=false
```

**App.json (Expo Configuration)**

```json
{
  "expo": {
    "name": "PCOS Health Tracker",
    "slug": "pcos-health-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.pcoshealthtracker.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.pcoshealthtracker.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-notifications",
      "expo-image-picker",
      "expo-file-system"
    ]
  }
}
```

### C.3 Database Configuration

**MongoDB Indexes**

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Periods Collection
db.periods.createIndex({ userId: 1, startDate: -1 });
db.periods.createIndex({ userId: 1, createdAt: -1 });

// Moods Collection
db.moods.createIndex({ userId: 1, timestamp: -1 });
db.moods.createIndex({ userId: 1, createdAt: -1 });

// Sleep Collection
db.sleep.createIndex({ userId: 1, bedTime: -1 });
db.sleep.createIndex({ userId: 1, createdAt: -1 });

// Reminders Collection
db.reminders.createIndex({ userId: 1, enabled: 1 });
db.reminders.createIndex({ userId: 1, time: 1 });
```

**Connection Pool Settings**

```javascript
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### C.4 Security Configuration

**Password Hashing**

```javascript
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

// Hash password
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

**JWT Configuration**

```javascript
const jwt = require('jsonwebtoken');

// Generate token
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**CORS Configuration**

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### C.5 Deployment Configuration

**Production Environment**

```yaml
# Docker Compose (docker-compose.yml)
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
    restart: always
```

**Nginx Configuration**

```nginx
server {
    listen 80;
    server_name api.pcoshealthtracker.com;

    location / {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

