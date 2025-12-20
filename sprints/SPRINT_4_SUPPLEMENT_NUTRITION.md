# SPRINT 4: Supplement & Nutrition Manager
**Duration:** Dec 22, 2025 - Jan 17, 2026 (~4 weeks)  
**Goal:** Reminders, nutrition logging, cycle tracking, smart alerts, integration  
**Total Story Points:** 30

## Tasks from Gantt Chart:
- Build Supplement Reminder System with Notifications (Dec 22 - Dec 25)
- Develop Nutrition Goal Setting & Meal Logging (Dec 25 - Dec 29)
- Implement Cycle Logging & Period Prediction Logic (Dec 30 - Jan 2)
- Develop Smart Alert (Dec 27 - Dec 30)
- Integrate All Modules & Data Flow (Dec 31 - Jan 5)
- Testing (Jan 6 - Jan 17)

---

## PCOS-29: Supplement Reminder System
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want to set reminders for supplements and medications.

**Acceptance Criteria:**
- [ ] Reminder screen with list of reminders
- [ ] Add reminder form:
  - Title input
  - Type selector (💊 Medication, 💉 Supplement, 💧 Water, 🏃 Exercise)
  - Time picker
  - Day selector (daily or specific days)
- [ ] Toggle reminder on/off
- [ ] Edit/delete reminders
- [ ] Push notifications using expo-notifications
- [ ] Notifications scheduled based on time/days
- [ ] Notifications cancelled when disabled

**Backend Requirements:**
- [ ] Reminder model in MongoDB
- [ ] CRUD endpoints for reminders
- [ ] Toggle active status endpoint

**Notification Setup:**
```typescript
// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: reminder.title,
    body: `Time for your ${reminder.type}!`,
  },
  trigger: {
    hour: parseInt(reminder.time.split(':')[0]),
    minute: parseInt(reminder.time.split(':')[1]),
    repeats: true,
  },
});
```

---

## PCOS-45: Nutrition Goal Setting & Meal Logging
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user, I want to log my meals and set nutrition goals.

**Acceptance Criteria:**
- [ ] Nutrition/meal logging screen
- [ ] Add meal entry:
  - Meal type (Breakfast, Lunch, Dinner, Snack)
  - Description/notes
  - Optional: calories, water intake
- [ ] Daily nutrition summary
- [ ] Goal setting:
  - Daily water goal
  - Meal tracking goal
- [ ] View meal history
- [ ] Local storage (AsyncStorage)

---

## PCOS-15: Cycle Logging & Period Prediction
**Type:** Story | **Priority:** Highest | **Points:** 8

**User Story:**  
As a user, I want to log my period and see predictions.

**Acceptance Criteria:**
- [ ] Period tracking screen with calendar
- [ ] Mark period start/end dates
- [ ] Visual highlighting of period days
- [ ] Flow intensity selection
- [ ] Symptom logging
- [ ] Cycle prediction algorithm:
  - Calculate average cycle length
  - Predict next period date
- [ ] Display "Day X of cycle"
- [ ] Display "Next period in X days"

**Backend Requirements:**
- [ ] Period model in MongoDB
- [ ] CRUD endpoints for periods

**Prediction Algorithm:**
```typescript
function predictNextPeriod(periods: Period[]): Date | null {
  if (periods.length < 2) return null;
  
  // Calculate average cycle length from last 3-6 periods
  const cycleLengths = [];
  for (let i = 0; i < periods.length - 1 && i < 5; i++) {
    const diff = daysBetween(periods[i+1].startDate, periods[i].startDate);
    cycleLengths.push(diff);
  }
  
  const avgCycle = average(cycleLengths) || 28;
  return addDays(periods[0].startDate, avgCycle);
}
```

---

## PCOS-33: Smart Alert System
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want personalized health insights based on my tracked data.

**Acceptance Criteria:**
- [ ] Insights/Smart Alert screen
- [ ] Analyze last 7 days of data:
  - Mood average and trends
  - Sleep average and quality
  - Symptom frequency
- [ ] Generate insights:
  - Warning: Low mood detected
  - Warning: Poor sleep pattern
  - Positive: Good mood streak
  - Suggestion: Sleep improvement tips
- [ ] Risk level indicator (Low/Moderate/High)
- [ ] Personalized tips based on data
- [ ] Health correlations (sleep-mood connection)
- [ ] Pull to refresh

**Insight Generation Rules:**
```typescript
// Warning insights
if (moodAvg < 2.5) → "Your mood has been low this week"
if (sleepAvg < 6) → "You're not getting enough sleep"
if (sleepQuality < 3) → "Your sleep quality needs attention"

// Positive insights
if (moodAvg > 4) → "Great mood this week! Keep it up!"
if (sleepStreak > 5) → "Excellent sleep consistency!"

// Suggestions
if (lowMood && poorSleep) → "Try improving sleep for better mood"
```

---

## PCOS-46: Integrate All Modules & Data Flow
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want all features to work together seamlessly.

**Acceptance Criteria:**
- [ ] Home screen shows summary from all modules:
  - Today's mood
  - Last night's sleep
  - Current cycle day
  - Active reminders count
- [ ] Navigation to all features from home
- [ ] Data flows correctly between screens
- [ ] Insights screen pulls from all data sources
- [ ] Profile shows streaks from mood/sleep
- [ ] Settings accessible from all screens
- [ ] Consistent UI/UX across app

---

## PCOS-T9: Final Testing
**Type:** Test | **Priority:** Highest | **Points:** 5

**Test Cases:**
| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Create reminder | Saves and schedules notification | ☐ |
| 2 | Reminder notification fires | Notification appears at time | ☐ |
| 3 | Log meal | Saves to local storage | ☐ |
| 4 | Log period | Saves and shows on calendar | ☐ |
| 5 | Period prediction | Shows accurate prediction | ☐ |
| 6 | Smart alerts generate | Insights based on data | ☐ |
| 7 | Home screen summary | Shows all module data | ☐ |
| 8 | End-to-end flow | Register → Log data → View insights | ☐ |
| 9 | Data persistence | All data survives restart | ☐ |
| 10 | Performance | App runs smoothly | ☐ |
| 11 | Error handling | Graceful error messages | ☐ |
| 12 | Offline behavior | Works without network | ☐ |

---

## Sprint 4 Deliverables Checklist
- [ ] Reminder system with notifications
- [ ] Nutrition/meal logging
- [ ] Period tracking with predictions
- [ ] Smart alert/insights system
- [ ] All modules integrated
- [ ] Home screen complete
- [ ] All test cases passing
- [ ] Bug fixes completed
- [ ] Final demo ready (Jan 17)
- [ ] Ready for deployment

---

# PROJECT TIMELINE SUMMARY

| Sprint | Duration | Dates | Focus |
|--------|----------|-------|-------|
| Sprint 1 | 2 weeks | Nov 3 - Nov 17, 2025 | Planning & Setup |
| Sprint 2 | 2 weeks | Nov 17 - Nov 30, 2025 | Auth & Profile |
| Sprint 3 | 3 weeks | Nov 30 - Dec 22, 2025 | Sleep & Mood |
| Sprint 4 | 4 weeks | Dec 22 - Jan 17, 2026 | Reminders, Nutrition, Insights |

**Total Project Duration:** Nov 3, 2025 - Jan 17, 2026 (~11 weeks)
