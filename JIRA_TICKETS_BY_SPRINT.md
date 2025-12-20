# PCOS Tracker App - JIRA Tickets by Sprint

## Project Overview

**Project Name:** PCOS Tracker Mobile Application  
**Tech Stack:**
- Frontend: React Native (Expo), TypeScript, NativeWind/TailwindCSS
- Backend: Node.js, Express.js, TypeScript, MongoDB
- Authentication: JWT

**Sprint Duration:** 2 weeks each  
**Total Sprints:** 8  
**Total Duration:** 16 weeks

---

# SPRINT 1: Project Foundation
**Duration:** Week 1-2  
**Goal:** Set up development environment and project structure  
**Total Story Points:** 9

---

## PCOS-1: Initialize React Native Expo Project
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a developer, I want a properly configured React Native Expo project so that I can start building the mobile application.

**Acceptance Criteria:**
- [ ] Expo project initialized with TypeScript template
- [ ] NativeWind/TailwindCSS configured for styling
- [ ] ESLint and Prettier configured
- [ ] Project runs on iOS simulator and Android emulator
- [ ] Folder structure created (screens, components, services, navigation, contexts, constants)

---

## PCOS-2: Initialize Backend Node.js Project
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a developer, I want a properly configured backend server so that I can build REST APIs.

**Acceptance Criteria:**
- [ ] Express.js server initialized with TypeScript
- [ ] MongoDB connection configured
- [ ] Environment variables setup (.env)
- [ ] CORS configured for mobile app access
- [ ] Folder structure created (controllers, routes, models, services, middleware, utils)
- [ ] Server runs successfully on configured port

---

## PCOS-3: Configure Navigation Structure
**Type:** Story | **Priority:** High | **Points:** 2

**User Story:**  
As a user, I want seamless navigation between screens.

**Acceptance Criteria:**
- [ ] React Navigation installed and configured
- [ ] Root Navigator (Auth vs Main stack switching)
- [ ] Auth Stack: Login, Register, Forgot Password
- [ ] Main Stack: Home and placeholder screens
- [ ] Navigation types defined in TypeScript

---

## PCOS-T1: Test Project Setup
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
- [ ] Frontend app builds without errors
- [ ] Frontend app runs on iOS/Android emulator
- [ ] Backend server starts successfully
- [ ] Backend connects to MongoDB
- [ ] Navigation between screens works
- [ ] Hot reload works on both frontend and backend

---

# SPRINT 2: User Authentication
**Duration:** Week 3-4  
**Goal:** Complete user authentication system  
**Total Story Points:** 22

---

## PCOS-4: User Registration API
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a new user, I want to create an account with my email and password so that I can access the app's features.

**Acceptance Criteria:**
- [ ] POST /api/auth/register endpoint created
- [ ] Email validation (format, uniqueness)
- [ ] Password validation (min 8 chars, complexity)
- [ ] Password hashed using bcrypt
- [ ] User stored in MongoDB
- [ ] JWT token returned on successful registration
- [ ] Proper error messages for validation failures

**API Contract:**
```
POST /api/auth/register
Request: { "name": "string", "email": "string", "password": "string" }
Response: { "token": "string", "user": { "id", "name", "email" } }
```

---

## PCOS-5: User Login API
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a registered user, I want to log in with my email and password so that I can access my personal data.

**Acceptance Criteria:**
- [ ] POST /api/auth/login endpoint created
- [ ] Email and password validation
- [ ] Password comparison with hashed password
- [ ] JWT token generated and returned
- [ ] User data returned (excluding password)
- [ ] Proper error messages for invalid credentials

**API Contract:**
```
POST /api/auth/login
Request: { "email": "string", "password": "string" }
Response: { "token": "string", "user": { "id", "name", "email" } }
```

---

## PCOS-6: Registration Screen (Frontend)
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a new user, I want a registration form so that I can create my account easily.

**Acceptance Criteria:**
- [ ] Name, email, password, confirm password fields
- [ ] Real-time form validation with error messages
- [ ] Password visibility toggle
- [ ] Loading state during API call
- [ ] Error message display from API
- [ ] Success navigation to home screen
- [ ] Link to login screen
- [ ] Responsive and accessible design

---

## PCOS-7: Login Screen (Frontend)
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a registered user, I want a login form so that I can access my account.

**Acceptance Criteria:**
- [ ] Email and password fields
- [ ] Form validation
- [ ] Password visibility toggle
- [ ] Loading state during API call
- [ ] Error message display
- [ ] Link to registration screen
- [ ] Link to forgot password screen

---

## PCOS-10: Auth Context & Token Management
**Type:** Story | **Priority:** Highest | **Points:** 3

**User Story:**  
As a user, I want my login state to persist so that I don't have to log in every time I open the app.

**Acceptance Criteria:**
- [ ] AuthContext created with React Context API
- [ ] Token stored in AsyncStorage
- [ ] Auto-login on app start if token exists
- [ ] Logout functionality clears token
- [ ] API interceptor adds auth headers automatically
- [ ] Handle 401 errors (token expired)

---

## PCOS-T2: Test Authentication Flow
**Type:** Test | **Priority:** Highest | **Points:** 3

**Test Cases:**
- [ ] Register with valid credentials - success
- [ ] Register with existing email - shows error
- [ ] Register with invalid email format - shows error
- [ ] Register with weak password - shows error
- [ ] Register with mismatched passwords - shows error
- [ ] Login with valid credentials - success
- [ ] Login with wrong password - shows error
- [ ] Login with non-existent email - shows error
- [ ] Token persists after app restart
- [ ] Logout clears token and redirects to login
- [ ] Protected routes redirect to login when not authenticated

---

# SPRINT 3: Period Tracking (Core Feature)
**Duration:** Week 5-6  
**Goal:** Implement complete period tracking functionality  
**Total Story Points:** 21

---

## PCOS-14: Period Data Model & API
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a user, I want to store my period data so that I can track my menstrual cycle.

**Acceptance Criteria:**
- [ ] Period model created in MongoDB
- [ ] POST /api/periods - create period entry
- [ ] GET /api/periods - get periods with date range filter
- [ ] PUT /api/periods/:id - update period
- [ ] DELETE /api/periods/:id - delete period
- [ ] Validation for date ranges (end >= start)
- [ ] User can only access their own data

**Data Model:**
```typescript
{
  userId: ObjectId,
  startDate: Date,
  endDate: Date,
  flow: 'light' | 'medium' | 'heavy',
  symptoms: string[],
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## PCOS-15: Period Tracking Screen
**Type:** Story | **Priority:** Highest | **Points:** 8

**User Story:**  
As a user, I want to log my period dates so that I can track my menstrual cycle.

**Acceptance Criteria:**
- [ ] Calendar view using react-native-calendars
- [ ] Tap to mark period start date
- [ ] Tap again to mark period end date
- [ ] Visual indicators for period days (colored dots/highlights)
- [ ] Flow intensity selection (light/medium/heavy)
- [ ] Common symptom selection chips
- [ ] Notes text field
- [ ] Save period entry button
- [ ] Display current cycle day
- [ ] Display predicted next period date
- [ ] Navigation to history screen

---

## PCOS-16: Period History Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to view my period history so that I can understand my cycle patterns.

**Acceptance Criteria:**
- [ ] List of past period entries (most recent first)
- [ ] Each entry shows: dates, duration, flow, symptoms
- [ ] Average cycle length calculation and display
- [ ] Average period duration calculation and display
- [ ] Tap entry to edit
- [ ] Swipe or button to delete entry
- [ ] Empty state when no history
- [ ] Pull to refresh

---

## PCOS-17: Period Service (Frontend)
**Type:** Story | **Priority:** High | **Points:** 3

**User Story:**  
As a developer, I need a service layer to interact with period APIs.

**Acceptance Criteria:**
- [ ] periodService.ts created
- [ ] createPeriod() function
- [ ] getPeriods(startDate, endDate) function
- [ ] updatePeriod(id, data) function
- [ ] deletePeriod(id) function
- [ ] calculateCycleLength() helper
- [ ] predictNextPeriod() helper
- [ ] TypeScript interfaces for Period data
- [ ] Error handling with user-friendly messages

---

## PCOS-T4: Test Period Tracking
**Type:** Test | **Priority:** Highest | **Points:** 3

**Test Cases:**
- [ ] Create new period entry - saves successfully
- [ ] Period appears on calendar with correct highlighting
- [ ] Edit period entry - updates correctly
- [ ] Delete period entry - removes from list and calendar
- [ ] Cannot create overlapping periods
- [ ] Cycle prediction calculates correctly based on history
- [ ] History displays all entries in correct order
- [ ] Average cycle length calculation is accurate
- [ ] Average period duration calculation is accurate
- [ ] Empty state shows when no periods logged

---

# SPRINT 4: Mood & Sleep Tracking
**Duration:** Week 7-8  
**Goal:** Implement mood and sleep tracking features  
**Total Story Points:** 24

---

## PCOS-18: Mood Data Model & API
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to store my mood data so that I can track my emotional wellbeing.

**Acceptance Criteria:**
- [ ] Mood model created in MongoDB
- [ ] POST /api/moods - create mood entry
- [ ] GET /api/moods - get moods with date range filter
- [ ] PUT /api/moods/:id - update mood
- [ ] DELETE /api/moods/:id - delete mood
- [ ] One entry per day validation (update if exists)

**Data Model:**
```typescript
{
  userId: ObjectId,
  date: Date,
  mood: number (1-5),
  emotions: string[],
  notes: string,
  createdAt: Date
}
```

---

## PCOS-19: Mood Tracking Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to log my daily mood so that I can track my emotional patterns.

**Acceptance Criteria:**
- [ ] Mood level selection (1-5) with emoji icons
- [ ] Visual feedback on mood selection
- [ ] Emotion tags selection (happy, sad, anxious, calm, angry, etc.)
- [ ] Notes/journal text field
- [ ] Date display (default today)
- [ ] Save mood entry button
- [ ] Loading state during save
- [ ] Success feedback
- [ ] Navigation to mood history

---

## PCOS-20: Mood History Screen
**Type:** Story | **Priority:** High | **Points:** 3

**User Story:**  
As a user, I want to view my mood history so that I can understand my emotional patterns.

**Acceptance Criteria:**
- [ ] Weekly mood visualization (chart or emoji row)
- [ ] List of mood entries
- [ ] Average mood score display
- [ ] Most frequent emotions display
- [ ] Mood streak counter
- [ ] Tap entry to view details
- [ ] Edit/delete functionality

---

## PCOS-22: Sleep Data Model & API
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to store my sleep data so that I can track my sleep patterns.

**Acceptance Criteria:**
- [ ] Sleep model created in MongoDB
- [ ] POST /api/sleep - create sleep entry
- [ ] GET /api/sleep - get sleep entries with date range
- [ ] PUT /api/sleep/:id - update sleep
- [ ] DELETE /api/sleep/:id - delete sleep
- [ ] Duration auto-calculated from bedtime/waketime

**Data Model:**
```typescript
{
  userId: ObjectId,
  date: Date,
  bedtime: string (HH:mm),
  wakeTime: string (HH:mm),
  duration: number (minutes),
  quality: number (1-5),
  notes: string,
  createdAt: Date
}
```

---

## PCOS-23: Sleep Tracking Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to log my sleep so that I can track my sleep quality and duration.

**Acceptance Criteria:**
- [ ] Bedtime picker (DateTimePicker - time mode)
- [ ] Wake time picker
- [ ] Duration auto-calculation and display
- [ ] Sleep quality rating (1-5 stars or slider)
- [ ] Notes text field
- [ ] Date selection (default last night)
- [ ] Save sleep entry button
- [ ] Navigation to sleep history

---

## PCOS-T5: Test Mood Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
- [ ] Create mood entry - saves successfully
- [ ] Only one mood entry per day (updates existing)
- [ ] Edit mood entry - updates correctly
- [ ] Delete mood entry - removes from history
- [ ] History displays entries correctly
- [ ] Average mood calculates accurately
- [ ] Mood streak counts consecutive days

---

## PCOS-T6: Test Sleep Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
- [ ] Create sleep entry - saves successfully
- [ ] Duration calculates correctly (including overnight)
- [ ] Edit sleep entry - updates correctly
- [ ] Delete sleep entry - removes from history
- [ ] History displays entries correctly
- [ ] Average sleep duration is accurate
- [ ] Quality labels display correctly

---

# SPRINT 5: Symptoms & Reminders
**Duration:** Week 9-10  
**Goal:** Implement symptom tracking and reminder system  
**Total Story Points:** 24

---

## PCOS-26: Symptom Tracking Screen
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user with PCOS, I want to log my daily symptoms so that I can track my condition.

**Acceptance Criteria:**
- [ ] Symptom categories with headers:
  - Physical: Cramps, Bloating, Headache, Fatigue, Back Pain
  - Hormonal: Acne, Hair Loss, Excess Hair Growth, Breast Tenderness
  - Emotional: Mood Swings, Anxiety, Depression, Irritability
  - Digestive: Nausea, Cravings, Digestive Issues
- [ ] Symptom selection with severity (mild/moderate/severe)
- [ ] Visual severity indicators (color coded)
- [ ] Date selection
- [ ] Notes field
- [ ] Save functionality
- [ ] View today's logged symptoms
- [ ] Edit existing symptoms for a date
- [ ] Data stored in AsyncStorage (local first)

---

## PCOS-28: Reminder Data Model & API
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to create reminders so that I don't forget important health tasks.

**Acceptance Criteria:**
- [ ] Reminder model created in MongoDB
- [ ] POST /api/reminders - create reminder
- [ ] GET /api/reminders - get user's reminders
- [ ] PUT /api/reminders/:id - update reminder
- [ ] DELETE /api/reminders/:id - delete reminder
- [ ] PATCH /api/reminders/:id/toggle - toggle active status

**Data Model:**
```typescript
{
  userId: ObjectId,
  title: string,
  type: 'medication' | 'supplement' | 'water' | 'exercise' | 'custom',
  time: string (HH:mm),
  days: string[] (e.g., ['Mon', 'Tue', 'Wed']),
  isActive: boolean,
  createdAt: Date
}
```

---

## PCOS-29: Reminder Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to manage my health reminders so that I can stay on track with my routine.

**Acceptance Criteria:**
- [ ] List of all reminders
- [ ] Add new reminder button/FAB
- [ ] Reminder creation form:
  - Title input
  - Type selection (medication, supplement, water, exercise, custom)
  - Time picker
  - Day selection (daily or specific days)
- [ ] Toggle reminder on/off with switch
- [ ] Edit reminder (tap to open form)
- [ ] Delete reminder (swipe or long press)
- [ ] Visual distinction for active vs inactive
- [ ] Empty state when no reminders

---

## PCOS-30: Push Notification Setup
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to receive push notifications for my reminders.

**Acceptance Criteria:**
- [ ] expo-notifications installed and configured
- [ ] Request notification permission on first reminder creation
- [ ] Schedule local notifications based on reminder time/days
- [ ] Cancel notifications when reminder deleted/disabled
- [ ] Reschedule notifications when reminder updated
- [ ] Handle notification tap (open app)
- [ ] Notification channels configured (Android)

---

## PCOS-T7: Test Symptom Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
- [ ] Select symptoms - UI updates correctly
- [ ] Set severity levels - displays correctly
- [ ] Save symptoms - data persists in storage
- [ ] Load symptoms for date - displays saved data
- [ ] Edit symptoms - updates correctly
- [ ] Clear symptoms for date - removes data
- [ ] Multiple categories work independently

---

## PCOS-T8: Test Reminders & Notifications
**Type:** Test | **Priority:** High | **Points:** 2

**Test Cases:**
- [ ] Create reminder - saves to backend
- [ ] Edit reminder - updates correctly
- [ ] Delete reminder - removes from list
- [ ] Toggle reminder on - schedules notification
- [ ] Toggle reminder off - cancels notification
- [ ] Notification permission requested appropriately
- [ ] Notification fires at scheduled time
- [ ] Reminder persists after app restart

---

# SPRINT 6: Profile & Account Management
**Duration:** Week 11-12  
**Goal:** Complete user profile and account features  
**Total Story Points:** 21

---

## PCOS-11: Profile Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to view my profile so that I can see my personal information and health summary.

**Acceptance Criteria:**
- [ ] Header with profile picture (or initials avatar)
- [ ] Display user name
- [ ] Display user email
- [ ] Quick stats section:
  - Current mood streak
  - Current sleep streak
  - Days since last period (optional)
- [ ] Edit profile button
- [ ] Navigation to settings
- [ ] Navigation to tracking screens
- [ ] Responsive design

---

## PCOS-12: Edit Profile Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to edit my profile so that I can update my personal information.

**Acceptance Criteria:**
- [ ] Profile picture section with camera icon
- [ ] Image picker integration (expo-image-picker)
- [ ] Option to take photo or choose from gallery
- [ ] Edit name field
- [ ] Edit email field with validation
- [ ] Save changes button
- [ ] Cancel/back navigation
- [ ] Loading state during save
- [ ] Success confirmation
- [ ] Image stored locally (AsyncStorage as base64)

---

## PCOS-8: Forgot Password Flow
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user who forgot my password, I want to reset it via email so that I can regain access to my account.

**Acceptance Criteria:**
- [ ] Forgot Password Screen with email input
- [ ] POST /api/auth/forgot-password endpoint
- [ ] Email service integration (Nodemailer)
- [ ] Reset token generation (expires in 1 hour)
- [ ] Email sent with reset link/code
- [ ] Reset Password Screen (enter new password)
- [ ] POST /api/auth/reset-password endpoint
- [ ] Token validation
- [ ] Password update
- [ ] Success message and redirect to login

---

## PCOS-9: Change Password Feature
**Type:** Story | **Priority:** Medium | **Points:** 3

**User Story:**  
As a logged-in user, I want to change my password so that I can maintain account security.

**Acceptance Criteria:**
- [ ] Change Password Screen
- [ ] Current password field
- [ ] New password field
- [ ] Confirm new password field
- [ ] PUT /api/auth/change-password endpoint
- [ ] Current password verification
- [ ] New password validation
- [ ] Success confirmation
- [ ] Error handling for wrong current password

---

## PCOS-T3: Test Profile Management
**Type:** Test | **Priority:** High | **Points:** 2

**Test Cases:**
- [ ] Profile screen displays correct user data
- [ ] Edit profile - name updates successfully
- [ ] Edit profile - email updates with validation
- [ ] Profile picture upload works
- [ ] Profile picture displays after upload
- [ ] Invalid email rejected on edit
- [ ] Profile updates persist after app restart
- [ ] Cancel edit discards changes

---

## PCOS-T13: Test Password Features
**Type:** Test | **Priority:** Medium | **Points:** 1

**Test Cases:**
- [ ] Forgot password - email sent successfully
- [ ] Reset password with valid token - success
- [ ] Reset password with expired token - error
- [ ] Change password with correct current password - success
- [ ] Change password with wrong current password - error
- [ ] New password validation works

---

# SPRINT 7: Smart Insights & Partner Sharing
**Duration:** Week 13-14  
**Goal:** Implement AI insights and partner sharing features  
**Total Story Points:** 24

---

## PCOS-33: Insights Screen
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want to see personalized health insights so that I can better understand my PCOS patterns.

**Acceptance Criteria:**
- [ ] Header with "Smart Cycle Alert" title
- [ ] Weekly health status indicator (risk level)
- [ ] Stats row:
  - Average mood (last 7 days)
  - Average sleep quality
  - Average sleep duration
- [ ] Insights cards section:
  - Warning insights (red)
  - Positive insights (green)
  - Suggestion insights (yellow)
- [ ] Health correlations section
- [ ] Top symptoms this week
- [ ] Personalized tips section
- [ ] Pull-to-refresh functionality
- [ ] Loading state while analyzing
- [ ] Empty state when insufficient data

---

## PCOS-34: PCOS Insights Service
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want the app to analyze my data and provide meaningful insights.

**Acceptance Criteria:**
- [ ] pcosInsightsService.ts created
- [ ] analyzeHealthData() function:
  - Fetch last 7 days of mood data
  - Fetch last 7 days of sleep data
  - Fetch last 7 days of symptom data
  - Calculate averages
  - Determine risk level (low/moderate/high)
- [ ] generateInsights() function:
  - Low mood detection
  - Poor sleep detection
  - Symptom frequency analysis
  - Positive trend detection
- [ ] findCorrelations() function:
  - Sleep-mood correlation
  - Symptom-mood correlation
- [ ] getPersonalizedTips() function
- [ ] TypeScript interfaces for all data types

**Insight Generation Rules:**
- Mood < 2.5 avg → Warning: "Your mood has been low"
- Sleep < 6 hours avg → Warning: "You're not getting enough sleep"
- Sleep quality < 3 → Suggestion: "Try improving sleep hygiene"
- Mood > 4 avg → Positive: "Great mood this week!"
- Consistent logging → Positive: "Keep up the tracking!"

---

## PCOS-36: Partner Sharing Screen
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user, I want to share my cycle information with my partner so they can be more supportive.

**Acceptance Criteria:**
- [ ] Enable/disable partner mode toggle
- [ ] Generate unique 6-character share code
- [ ] Display share code prominently
- [ ] Copy code to clipboard button (expo-clipboard)
- [ ] Share code via system share sheet
- [ ] Privacy settings toggles:
  - Share period & cycle data
  - Share mood data
  - Share sleep data
- [ ] Regenerate code option with confirmation
- [ ] Connect to partner section (enter their code)
- [ ] Disable sharing with confirmation dialog
- [ ] Settings persist in AsyncStorage

---

## PCOS-T9: Test Smart Insights
**Type:** Test | **Priority:** High | **Points:** 2

**Test Cases:**
- [ ] Insights screen loads with sufficient data
- [ ] Insights screen shows empty state with no data
- [ ] Average calculations are accurate
- [ ] Risk level displays appropriately based on data
- [ ] Warning insights appear for low mood/poor sleep
- [ ] Positive insights appear for good trends
- [ ] Correlations generate when patterns exist
- [ ] Tips are relevant to user's data
- [ ] Refresh updates all data

---

## PCOS-T10: Test Partner Sharing
**Type:** Test | **Priority:** Medium | **Points:** 1

**Test Cases:**
- [ ] Enable partner mode - generates 6-char code
- [ ] Code is alphanumeric and readable
- [ ] Copy code - clipboard contains code
- [ ] Share code - system share sheet opens
- [ ] Privacy toggles save correctly
- [ ] Regenerate code - creates new unique code
- [ ] Disable sharing - shows confirmation
- [ ] Settings persist after app restart

---

# SPRINT 8: Settings, Export & Polish
**Duration:** Week 15-16  
**Goal:** Complete settings, data export, and final polish  
**Total Story Points:** 23

---

## PCOS-38: Settings Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want a centralized settings screen to manage my app preferences.

**Acceptance Criteria:**
- [ ] User profile card at top (photo, name, email)
- [ ] Settings sections with navigation:
  - Account: Change Password, Partner Mode
  - Notifications
  - Export Data
  - Help & FAQ
  - Contact Support
  - Privacy Policy
  - About
- [ ] Logout button with confirmation
- [ ] App version display at bottom
- [ ] Clean, organized UI with section headers

---

## PCOS-44: Export Data Screen
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user, I want to export my health data so that I can share it with my doctor or keep a backup.

**Acceptance Criteria:**
- [ ] Data type selection checkboxes:
  - Period data
  - Mood data
  - Sleep data
  - Symptom data
  - Select all option
- [ ] Date range picker (start/end dates)
- [ ] Export format: CSV
- [ ] Generate export button
- [ ] Loading state during generation
- [ ] Preview of data to export (count)
- [ ] Share via system share sheet (expo-sharing)
- [ ] Success confirmation

---

## PCOS-31: Notification Settings Screen
**Type:** Story | **Priority:** Medium | **Points:** 3

**User Story:**  
As a user, I want to control my notification preferences.

**Acceptance Criteria:**
- [ ] Master toggle for all notifications
- [ ] Individual toggles by type:
  - Reminder notifications
  - Period predictions
  - Daily tracking reminders
- [ ] Quiet hours setting (optional)
- [ ] Save preferences to AsyncStorage
- [ ] Sync with system notification permissions

---

## PCOS-40: Help & FAQ Screen
**Type:** Story | **Priority:** Medium | **Points:** 3

**User Story:**  
As a user, I want to find answers to common questions about the app.

**Acceptance Criteria:**
- [ ] Expandable/collapsible FAQ sections
- [ ] Categories:
  - Getting Started (3-5 questions)
  - Period Tracking (3-5 questions)
  - PCOS Information (3-5 questions)
  - Account & Privacy (3-5 questions)
- [ ] Smooth expand/collapse animation
- [ ] Link to contact support at bottom

---

## PCOS-41: Contact Support Screen
**Type:** Story | **Priority:** Medium | **Points:** 2

**User Story:**  
As a user, I want to contact support if I have issues or questions.

**Acceptance Criteria:**
- [ ] Subject/category dropdown
- [ ] Message text area
- [ ] Submit button
- [ ] Opens email client with pre-filled info (mailto:)
- [ ] Or sends via API if backend support exists
- [ ] Success confirmation
- [ ] Support email displayed

---

## PCOS-42: Privacy Policy Screen
**Type:** Story | **Priority:** Medium | **Points:** 1

**User Story:**  
As a user, I want to read the privacy policy to understand how my data is used.

**Acceptance Criteria:**
- [ ] Scrollable privacy policy text
- [ ] Last updated date
- [ ] Clear sections (Data Collection, Usage, Storage, Rights)
- [ ] Professional formatting

---

## PCOS-43: About Screen
**Type:** Story | **Priority:** Low | **Points:** 1

**User Story:**  
As a user, I want to learn about the app and its creators.

**Acceptance Criteria:**
- [ ] App logo/icon
- [ ] App name and tagline
- [ ] Version number
- [ ] Brief app description
- [ ] Developer/team information
- [ ] Acknowledgments (optional)

---

## PCOS-T11: Test Settings Screens
**Type:** Test | **Priority:** Medium | **Points:** 2

**Test Cases:**
- [ ] Settings screen displays all options
- [ ] Navigation to each sub-screen works
- [ ] Notification settings save correctly
- [ ] FAQ sections expand/collapse smoothly
- [ ] Contact support opens email/submits
- [ ] Privacy policy displays and scrolls
- [ ] About screen displays correctly
- [ ] Logout works and redirects to login

---

## PCOS-T12: Test Data Export
**Type:** Test | **Priority:** Medium | **Points:** 1

**Test Cases:**
- [ ] Select single data type - exports correctly
- [ ] Select multiple data types - exports all
- [ ] Select all - includes everything
- [ ] Date range filter works
- [ ] CSV format is valid and readable
- [ ] Share sheet opens with file
- [ ] Empty data handled gracefully (shows message)

---

---

# SPRINT SUMMARY

| Sprint | Duration | Focus Area | Story Points | Stories | Tests |
|--------|----------|------------|--------------|---------|-------|
| Sprint 1 | Week 1-2 | Project Foundation | 9 | 3 | 1 |
| Sprint 2 | Week 3-4 | User Authentication | 22 | 5 | 1 |
| Sprint 3 | Week 5-6 | Period Tracking | 21 | 4 | 1 |
| Sprint 4 | Week 7-8 | Mood & Sleep Tracking | 24 | 5 | 2 |
| Sprint 5 | Week 9-10 | Symptoms & Reminders | 24 | 4 | 2 |
| Sprint 6 | Week 11-12 | Profile & Account | 21 | 4 | 2 |
| Sprint 7 | Week 13-14 | Insights & Partner | 24 | 3 | 2 |
| Sprint 8 | Week 15-16 | Settings & Export | 23 | 7 | 2 |
| **TOTAL** | **16 weeks** | | **168** | **35** | **13** |

---

# TICKET ID REFERENCE

## Sprint 1
- PCOS-1: Initialize React Native Expo Project
- PCOS-2: Initialize Backend Node.js Project
- PCOS-3: Configure Navigation Structure
- PCOS-T1: Test Project Setup

## Sprint 2
- PCOS-4: User Registration API
- PCOS-5: User Login API
- PCOS-6: Registration Screen (Frontend)
- PCOS-7: Login Screen (Frontend)
- PCOS-10: Auth Context & Token Management
- PCOS-T2: Test Authentication Flow

## Sprint 3
- PCOS-14: Period Data Model & API
- PCOS-15: Period Tracking Screen
- PCOS-16: Period History Screen
- PCOS-17: Period Service (Frontend)
- PCOS-T4: Test Period Tracking

## Sprint 4
- PCOS-18: Mood Data Model & API
- PCOS-19: Mood Tracking Screen
- PCOS-20: Mood History Screen
- PCOS-22: Sleep Data Model & API
- PCOS-23: Sleep Tracking Screen
- PCOS-T5: Test Mood Tracking
- PCOS-T6: Test Sleep Tracking

## Sprint 5
- PCOS-26: Symptom Tracking Screen
- PCOS-28: Reminder Data Model & API
- PCOS-29: Reminder Screen
- PCOS-30: Push Notification Setup
- PCOS-T7: Test Symptom Tracking
- PCOS-T8: Test Reminders & Notifications

## Sprint 6
- PCOS-8: Forgot Password Flow
- PCOS-9: Change Password Feature
- PCOS-11: Profile Screen
- PCOS-12: Edit Profile Screen
- PCOS-T3: Test Profile Management
- PCOS-T13: Test Password Features

## Sprint 7
- PCOS-33: Insights Screen
- PCOS-34: PCOS Insights Service
- PCOS-36: Partner Sharing Screen
- PCOS-T9: Test Smart Insights
- PCOS-T10: Test Partner Sharing

## Sprint 8
- PCOS-31: Notification Settings Screen
- PCOS-38: Settings Screen
- PCOS-40: Help & FAQ Screen
- PCOS-41: Contact Support Screen
- PCOS-42: Privacy Policy Screen
- PCOS-43: About Screen
- PCOS-44: Export Data Screen
- PCOS-T11: Test Settings Screens
- PCOS-T12: Test Data Export

---

# EPIC MAPPING

| Epic | Epic Name | Tickets |
|------|-----------|---------|
| PCOS-E1 | Project Setup | PCOS-1, PCOS-2, PCOS-3, PCOS-T1 |
| PCOS-E2 | Authentication | PCOS-4, PCOS-5, PCOS-6, PCOS-7, PCOS-8, PCOS-9, PCOS-10, PCOS-T2, PCOS-T13 |
| PCOS-E3 | Profile Management | PCOS-11, PCOS-12, PCOS-T3 |
| PCOS-E4 | Period Tracking | PCOS-14, PCOS-15, PCOS-16, PCOS-17, PCOS-T4 |
| PCOS-E5 | Mood Tracking | PCOS-18, PCOS-19, PCOS-20, PCOS-T5 |
| PCOS-E6 | Sleep Tracking | PCOS-22, PCOS-23, PCOS-T6 |
| PCOS-E7 | Symptom Tracking | PCOS-26, PCOS-T7 |
| PCOS-E8 | Reminders | PCOS-28, PCOS-29, PCOS-30, PCOS-31, PCOS-T8 |
| PCOS-E9 | Smart Insights | PCOS-33, PCOS-34, PCOS-T9 |
| PCOS-E10 | Partner Sharing | PCOS-36, PCOS-T10 |
| PCOS-E11 | Settings | PCOS-38, PCOS-40, PCOS-41, PCOS-42, PCOS-43, PCOS-T11 |
| PCOS-E12 | Data Export | PCOS-44, PCOS-T12 |

---

# DEPENDENCIES

```
PCOS-1, PCOS-2 → PCOS-3 (Navigation needs both projects)
PCOS-4, PCOS-5 → PCOS-6, PCOS-7 (Frontend needs API)
PCOS-10 → All authenticated features
PCOS-14 → PCOS-15, PCOS-16, PCOS-17
PCOS-18 → PCOS-19, PCOS-20
PCOS-22 → PCOS-23
PCOS-28 → PCOS-29, PCOS-30
PCOS-18, PCOS-22, PCOS-26 → PCOS-34 (Insights needs tracking data)
```

---

*Document generated for PCOS Tracker App - Agile Development*
