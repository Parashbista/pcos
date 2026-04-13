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
- [ ] Mood model/types defined
- [ ] POST /api/moods - create/update mood entry
- [ ] GET /api/moods?startDate=&endDate= - get moods
- [ ] PUT /api/moods/:id - update mood
- [ ] DELETE /api/moods/:id - delete mood
- [ ] One entry per day (upsert logic)
- [ ] Auth middleware on all routes

**Data Model:**
```typescript
interface Mood {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  mood: number; // 1-5 scale
  emotions: string[]; // ['happy', 'anxious', 'calm']
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**API Contracts:**
```
POST /api/moods
Body: { date, mood, emotions, notes }
Response: { mood: Mood }

GET /api/moods?startDate=2024-01-01&endDate=2024-01-31
Response: { moods: Mood[] }
```

---

## PCOS-19: Mood Tracking Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to log my daily mood so that I can track my emotional patterns.

**Acceptance Criteria:**
- [ ] Header with date display
- [ ] Mood selector with 5 levels:
  - 1: 😢 Terrible
  - 2: 😔 Bad  
  - 3: 😐 Okay
  - 4: 🙂 Good
  - 5: 😄 Great
- [ ] Large emoji display for selected mood
- [ ] Emotion tags (multi-select chips):
  - Happy, Sad, Anxious, Calm, Angry
  - Stressed, Energetic, Tired, Hopeful, Irritable
- [ ] Notes text area
- [ ] Save button with loading state
- [ ] Success feedback (toast/animation)
- [ ] Load existing mood for today on mount
- [ ] Navigation to mood history

**UI Design:**
- Emoji buttons in a row
- Selected mood highlighted with scale animation
- Emotion chips with checkmarks when selected

---

## PCOS-20: Mood History Screen
**Type:** Story | **Priority:** High | **Points:** 3

**User Story:**  
As a user, I want to view my mood history so that I can understand my emotional patterns.

**Acceptance Criteria:**
- [ ] Weekly mood visualization (7 emoji row or mini chart)
- [ ] Statistics card:
  - Average mood this week
  - Most common emotion
  - Current streak (days logged)
- [ ] List of mood entries
- [ ] Each entry shows: date, mood emoji, emotions
- [ ] Tap to view/edit entry
- [ ] Filter by week/month (optional)
- [ ] Empty state handling

---

## PCOS-22: Sleep Data Model & API
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to store my sleep data so that I can track my sleep patterns.

**Acceptance Criteria:**
- [ ] Sleep model/types defined
- [ ] POST /api/sleep - create sleep entry
- [ ] GET /api/sleep?startDate=&endDate= - get entries
- [ ] PUT /api/sleep/:id - update sleep
- [ ] DELETE /api/sleep/:id - delete sleep
- [ ] Duration auto-calculated server-side
- [ ] Auth middleware on all routes

**Data Model:**
```typescript
interface Sleep {
  _id: ObjectId;
  userId: ObjectId;
  date: Date; // the night of (e.g., sleep on Jan 15 night)
  bedtime: string; // "23:30"
  wakeTime: string; // "07:00"
  duration: number; // minutes (auto-calculated)
  quality: number; // 1-5 scale
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Duration Calculation:**
```typescript
// Handle overnight sleep
function calculateDuration(bedtime: string, wakeTime: string): number {
  const bed = parseTime(bedtime); // minutes from midnight
  const wake = parseTime(wakeTime);
  if (wake < bed) {
    return (24 * 60 - bed) + wake; // overnight
  }
  return wake - bed;
}
```

---

## PCOS-23: Sleep Tracking Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to log my sleep so that I can track my sleep quality and duration.

**Acceptance Criteria:**
- [ ] Header with "Log Sleep" title
- [ ] Date selector (default: last night)
- [ ] Bedtime picker:
  - Time picker component
  - "I went to bed at" label
- [ ] Wake time picker:
  - Time picker component  
  - "I woke up at" label
- [ ] Duration display (auto-calculated):
  - "You slept for X hours Y minutes"
  - Color coded (green >7h, yellow 5-7h, red <5h)
- [ ] Sleep quality rating:
  - 5 stars or slider
  - Labels: Poor, Fair, Good, Great, Excellent
- [ ] Notes text area
- [ ] Save button
- [ ] Navigation to sleep history

**UI Components:**
- @react-native-community/datetimepicker for time selection
- Star rating component
- Duration display card

---

## PCOS-T5: Test Mood Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Log mood | Select mood 4, emotions, save | Mood saved successfully | ☐ |
| 2 | One per day | Log mood twice same day | Updates existing entry | ☐ |
| 3 | Edit mood | Open today's mood, change | Mood updated | ☐ |
| 4 | Delete mood | Delete from history | Mood removed | ☐ |
| 5 | Mood history | Log 7 days of moods | All shown in history | ☐ |
| 6 | Average mood | Log varied moods | Correct average displayed | ☐ |
| 7 | Mood streak | Log 5 consecutive days | Streak shows "5 days" | ☐ |
| 8 | Emotions saved | Select 3 emotions | All 3 saved and displayed | ☐ |

---

## PCOS-T6: Test Sleep Tracking
**Type:** Test | **Priority:** High | **Points:** 1

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Log sleep | Set times, quality, save | Sleep entry saved | ☐ |
| 2 | Duration calc | Bed 23:00, wake 07:00 | Shows "8 hours" | ☐ |
| 3 | Overnight calc | Bed 01:00, wake 09:00 | Shows "8 hours" | ☐ |
| 4 | Edit sleep | Change wake time | Duration recalculated | ☐ |
| 5 | Delete sleep | Delete from history | Entry removed | ☐ |
| 6 | Quality labels | Select quality 4 | Shows "Great" label | ☐ |
| 7 | Sleep history | Log 7 nights | All shown in history | ☐ |
| 8 | Average sleep | Log varied durations | Correct average shown | ☐ |

---

## Sprint 4 Deliverables Checklist
- [ ] Mood API endpoints working
- [ ] Mood tracking screen complete
- [ ] Mood history screen complete
- [ ] Sleep API endpoints working
- [ ] Sleep tracking screen complete
- [ ] Sleep history screen complete
- [ ] Duration calculations accurate
- [ ] All test cases passing
- [ ] Code reviewed and merged
- [ ] Sprint demo ready
