# SPRINT 3: Sleep & Mood Trackers
**Duration:** Nov 30, 2025 - Dec 22, 2025 (~3 weeks)  
**Goal:** Implement sleep tracking, mood journal, and basic charts  
**Total Story Points:** 24

## Tasks from Gantt Chart:
- Develop Sleep Tracker UI & Logging Functionality (Nov 30 - Dec 5)
- Implement Mood Journal with Emoji & Note Input (Dec 6 - Dec 10)
- Create Basic Charts for Sleep & Mood Data (Dec 11 - Dec 16)
- Testing (Dec 17 - Dec 22)

---

## PCOS-22: Sleep Tracker UI & Logging
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want to log my sleep so that I can track my sleep patterns.

**Acceptance Criteria:**
- [ ] Sleep tracking screen with clean UI
- [ ] Bedtime picker (time selector)
- [ ] Wake time picker
- [ ] Duration auto-calculation and display
- [ ] Sleep quality rating (1-5 stars)
- [ ] Notes text field
- [ ] Save sleep entry to backend
- [ ] View sleep history list
- [ ] Edit/delete past entries

**Backend Requirements:**
- [ ] Sleep model in MongoDB
- [ ] POST /api/sleep - create entry
- [ ] GET /api/sleep - get entries with date filter
- [ ] PUT /api/sleep/:id - update
- [ ] DELETE /api/sleep/:id - delete

**Data Model:**
```typescript
interface Sleep {
  userId: ObjectId;
  date: Date;
  bedtime: string; // "23:30"
  wakeTime: string; // "07:00"
  duration: number; // minutes
  quality: number; // 1-5
  notes: string;
}
```

---

## PCOS-19: Mood Journal with Emoji & Notes
**Type:** Story | **Priority:** High | **Points:** 8

**User Story:**  
As a user, I want to log my daily mood with emojis and notes.

**Acceptance Criteria:**
- [ ] Mood tracking screen
- [ ] 5-level mood selector with emojis:
  - 😢 Terrible (1)
  - 😔 Bad (2)
  - 😐 Okay (3)
  - 🙂 Good (4)
  - 😄 Great (5)
- [ ] Emotion tags selection (happy, sad, anxious, calm, etc.)
- [ ] Notes/journal text area
- [ ] Save mood entry to backend
- [ ] One entry per day (update if exists)
- [ ] View mood history

**Backend Requirements:**
- [ ] Mood model in MongoDB
- [ ] POST /api/moods - create/update entry
- [ ] GET /api/moods - get entries with date filter
- [ ] PUT /api/moods/:id - update
- [ ] DELETE /api/moods/:id - delete

---

## PCOS-35: Basic Charts for Sleep & Mood
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user, I want to see charts of my sleep and mood data.

**Acceptance Criteria:**
- [ ] Sleep history screen with:
  - Weekly sleep duration chart/visualization
  - Average sleep duration display
  - Average sleep quality display
  - List of recent entries
- [ ] Mood history screen with:
  - Weekly mood visualization (emoji row or chart)
  - Average mood score
  - Most common emotions
  - Mood streak counter
- [ ] Pull to refresh data

---

## PCOS-T5: Testing Sleep & Mood Features
**Type:** Test | **Priority:** High | **Points:** 3

**Test Cases:**
| # | Test Case | Expected Result | Status |
|---|-----------|-----------------|--------|
| 1 | Log sleep entry | Saves successfully | ☐ |
| 2 | Duration calculates correctly | 23:00-07:00 = 8 hours | ☐ |
| 3 | Edit sleep entry | Updates correctly | ☐ |
| 4 | Delete sleep entry | Removes from list | ☐ |
| 5 | Log mood entry | Saves successfully | ☐ |
| 6 | One mood per day | Updates existing | ☐ |
| 7 | Mood history displays | Shows all entries | ☐ |
| 8 | Sleep chart renders | Shows weekly data | ☐ |
| 9 | Mood streak counts | Consecutive days counted | ☐ |
| 10 | Data persists | Survives app restart | ☐ |

---

## Sprint 3 Deliverables Checklist
- [ ] Sleep tracking screen complete
- [ ] Sleep API endpoints working
- [ ] Mood journal screen complete
- [ ] Mood API endpoints working
- [ ] Basic charts/visualizations
- [ ] All test cases passing
- [ ] Code reviewed and merged
- [ ] Sprint demo ready (Dec 22)
