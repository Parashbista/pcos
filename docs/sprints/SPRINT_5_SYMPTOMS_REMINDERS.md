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
- [ ] Header with date selector
- [ ] Symptom categories with expandable sections:

**Physical Symptoms:**
- Cramps
- Bloating
- Headache
- Fatigue
- Back Pain
- Breast Tenderness

**Hormonal Symptoms:**
- Acne
- Hair Loss
- Excess Hair Growth
- Hot Flashes
- Weight Changes

**Emotional Symptoms:**
- Mood Swings
- Anxiety
- Depression
- Irritability
- Brain Fog

**Digestive Symptoms:**
- Nausea
- Cravings
- Digestive Issues
- Appetite Changes

- [ ] Each symptom has severity selector:
  - None (not selected)
  - Mild (yellow)
  - Moderate (orange)
  - Severe (red)
- [ ] Visual severity indicators
- [ ] Notes field
- [ ] Save button
- [ ] Load existing symptoms for selected date
- [ ] Data stored in AsyncStorage
- [ ] Summary of today's symptoms at top

**Data Structure (Local):**
```typescript
interface SymptomEntry {
  date: string; // YYYY-MM-DD
  symptoms: {
    [symptomName: string]: 'mild' | 'moderate' | 'severe';
  };
  notes: string;
  updatedAt: string;
}
```

---

## PCOS-28: Reminder Data Model & API
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to create reminders so that I don't forget important health tasks.

**Acceptance Criteria:**
- [ ] Reminder model defined
- [ ] POST /api/reminders - create reminder
- [ ] GET /api/reminders - get user's reminders
- [ ] PUT /api/reminders/:id - update reminder
- [ ] DELETE /api/reminders/:id - delete reminder
- [ ] PATCH /api/reminders/:id/toggle - toggle active
- [ ] Auth middleware on all routes

**Data Model:**
```typescript
interface Reminder {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  type: 'medication' | 'supplement' | 'water' | 'exercise' | 'custom';
  time: string; // "09:00"
  days: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**API Contracts:**
```
POST /api/reminders
Body: { title, type, time, days }
Response: { reminder: Reminder }

GET /api/reminders
Response: { reminders: Reminder[] }

PATCH /api/reminders/:id/toggle
Response: { reminder: Reminder }
```

---

## PCOS-29: Reminder Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to manage my health reminders so that I can stay on track with my routine.

**Acceptance Criteria:**
- [ ] Header with "Reminders" title
- [ ] Add reminder FAB or button
- [ ] List of reminders grouped by type
- [ ] Each reminder card shows:
  - Icon based on type
  - Title
  - Time
  - Days (e.g., "Mon, Wed, Fri" or "Daily")
  - Active/inactive toggle switch
- [ ] Add/Edit reminder modal:
  - Title input
  - Type selector (icons):
    - 💊 Medication
    - 💉 Supplement
    - 💧 Water
    - 🏃 Exercise
    - ✏️ Custom
  - Time picker
  - Day selector (7 day buttons, multi-select)
  - Save/Cancel buttons
- [ ] Swipe to delete with confirmation
- [ ] Empty state: "No reminders yet"
- [ ] Toggle schedules/cancels notification

---

## PCOS-30: Push Notification Setup
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to receive push notifications for my reminders.

**Acceptance Criteria:**
- [ ] expo-notifications installed
- [ ] notificationService.ts created
- [ ] Request permission function:
  ```typescript
  async function requestPermissions(): Promise<boolean>
  ```
- [ ] Schedule notification function:
  ```typescript
  async function scheduleReminder(reminder: Reminder): Promise<string>
  ```
- [ ] Cancel notification function:
  ```typescript
  async function cancelReminder(notificationId: string): Promise<void>
  ```
- [ ] Permission requested on first reminder creation
- [ ] Notifications scheduled based on time and days
- [ ] Notifications cancelled when reminder disabled/deleted
- [ ] Notification tap opens app
- [ ] Android notification channel configured

**Notification Content:**
```typescript
{
  title: reminder.title,
  body: `Time for your ${reminder.type}!`,
  data: { reminderId: reminder._id }
}
```

**Scheduling Logic:**
```typescript
// For each active day, schedule weekly repeating notification
// Use expo-notifications trigger with weekday and hour/minute
```

---

## PCOS-T7: Test Symptom Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Select symptom | Tap "Cramps" | Severity options appear | ☐ |
| 2 | Set severity | Select "Moderate" | Symptom highlighted orange | ☐ |
| 3 | Save symptoms | Select 3 symptoms, save | Data persisted | ☐ |
| 4 | Load symptoms | Reopen screen same day | Previous selections shown | ☐ |
| 5 | Change date | Select yesterday | Different/empty symptoms | ☐ |
| 6 | Clear symptom | Tap selected symptom | Severity cleared | ☐ |
| 7 | Notes saved | Add notes, save | Notes persisted | ☐ |
| 8 | Multiple categories | Select from each category | All saved correctly | ☐ |

---

## PCOS-T8: Test Reminders & Notifications
**Type:** Test | **Priority:** High | **Points:** 2

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Create reminder | Fill form, save | Reminder in list | ☐ |
| 2 | Edit reminder | Tap, change time | Reminder updated | ☐ |
| 3 | Delete reminder | Swipe, confirm | Reminder removed | ☐ |
| 4 | Toggle on | Enable inactive reminder | Switch on, notification scheduled | ☐ |
| 5 | Toggle off | Disable active reminder | Switch off, notification cancelled | ☐ |
| 6 | Permission request | Create first reminder | Permission dialog shown | ☐ |
| 7 | Notification fires | Wait for scheduled time | Notification appears | ☐ |
| 8 | Daily reminder | Set all 7 days | Shows "Daily" label | ☐ |
| 9 | Specific days | Set Mon, Wed, Fri | Shows "Mon, Wed, Fri" | ☐ |
| 10 | Persistence | Create reminder, restart | Reminder still exists | ☐ |

---

## Sprint 5 Deliverables Checklist
- [ ] Symptom tracking screen complete
- [ ] Symptom data persisting locally
- [ ] Reminder API endpoints working
- [ ] Reminder screen complete
- [ ] Notifications configured
- [ ] Notifications scheduling correctly
- [ ] All test cases passing
- [ ] Code reviewed and merged
- [ ] Sprint demo ready
