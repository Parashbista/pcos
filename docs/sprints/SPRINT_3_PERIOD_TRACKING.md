# SPRINT 3: Period Tracking
**Duration:** Week 5-6  
**Goal:** Implement complete period tracking functionality  
**Total Story Points:** 21

---

## PCOS-14: Period Data Model & API
**Type:** Story | **Priority:** Highest | **Points:** 5

**User Story:**  
As a user, I want to store my period data so that I can track my menstrual cycle.

**Acceptance Criteria:**
- [ ] Period model/types defined
- [ ] POST /api/periods - create period entry
- [ ] GET /api/periods?startDate=&endDate= - get periods
- [ ] PUT /api/periods/:id - update period
- [ ] DELETE /api/periods/:id - delete period
- [ ] Auth middleware on all routes
- [ ] Validation: endDate >= startDate
- [ ] User can only access own periods

**Data Model:**
```typescript
interface Period {
  _id: ObjectId;
  userId: ObjectId;
  startDate: Date;
  endDate: Date;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**API Contracts:**
```
POST /api/periods
Authorization: Bearer <token>
Body: { startDate, endDate, flow, symptoms, notes }
Response: { period: Period }

GET /api/periods?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
Response: { periods: Period[] }

PUT /api/periods/:id
Authorization: Bearer <token>
Body: { startDate?, endDate?, flow?, symptoms?, notes? }
Response: { period: Period }

DELETE /api/periods/:id
Authorization: Bearer <token>
Response: { message: "Period deleted" }
```

---

## PCOS-15: Period Tracking Screen
**Type:** Story | **Priority:** Highest | **Points:** 8

**User Story:**  
As a user, I want to log my period dates so that I can track my menstrual cycle.

**Acceptance Criteria:**
- [ ] Calendar component (react-native-calendars)
- [ ] Period days highlighted with pink/red color
- [ ] Predicted period days shown with lighter color
- [ ] Tap date to start logging period
- [ ] Period logging modal/form:
  - Start date (selected date)
  - End date picker
  - Flow intensity (light/medium/heavy buttons)
  - Symptom chips (cramps, bloating, headache, etc.)
  - Notes text input
  - Save button
- [ ] Current cycle day display ("Day X of cycle")
- [ ] Next period prediction ("Expected in X days")
- [ ] View/edit existing period on tap
- [ ] Navigation to history screen
- [ ] Loading states
- [ ] Pull to refresh

**UI Components:**
- Calendar with marked dates
- Flow selector (3 buttons)
- Symptom chips (multi-select)
- Cycle info card

---

## PCOS-16: Period History Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to view my period history so that I can understand my cycle patterns.

**Acceptance Criteria:**
- [ ] List of past periods (FlatList)
- [ ] Each item shows:
  - Date range (e.g., "Jan 15 - Jan 20, 2024")
  - Duration (e.g., "5 days")
  - Flow intensity icon/badge
  - Symptoms count
- [ ] Statistics card at top:
  - Average cycle length (e.g., "28 days")
  - Average period duration (e.g., "5 days")
  - Total periods logged
- [ ] Tap entry to edit (opens edit modal)
- [ ] Swipe to delete with confirmation
- [ ] Empty state: "No periods logged yet"
- [ ] Pull to refresh
- [ ] Back navigation

---

## PCOS-17: Period Service (Frontend)
**Type:** Story | **Priority:** High | **Points:** 3

**User Story:**  
As a developer, I need a service layer to interact with period APIs.

**Acceptance Criteria:**
- [ ] periodService.ts created
- [ ] Functions:
  ```typescript
  createPeriod(data: CreatePeriodInput): Promise<Period>
  getPeriods(startDate: string, endDate: string): Promise<Period[]>
  updatePeriod(id: string, data: UpdatePeriodInput): Promise<Period>
  deletePeriod(id: string): Promise<void>
  ```
- [ ] Helper functions:
  ```typescript
  calculateCycleLength(periods: Period[]): number
  calculateAverageDuration(periods: Period[]): number
  predictNextPeriod(periods: Period[]): Date | null
  getCurrentCycleDay(lastPeriod: Period): number
  ```
- [ ] TypeScript interfaces
- [ ] Error handling with user-friendly messages

**Prediction Algorithm:**
```typescript
// Average of last 3-6 cycles
// Default to 28 days if insufficient data
function predictNextPeriod(periods: Period[]): Date | null {
  if (periods.length < 2) return null;
  const avgCycle = calculateCycleLength(periods);
  const lastPeriod = periods[0]; // most recent
  return addDays(lastPeriod.startDate, avgCycle);
}
```

---

## PCOS-T4: Test Period Tracking
**Type:** Test | **Priority:** Highest | **Points:** 3

**Test Cases:**
| # | Test Case | Steps | Expected Result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Create period | Select dates, flow, save | Period saved, shown on calendar | ☐ |
| 2 | Calendar highlighting | Log period Jan 15-20 | Those dates highlighted pink | ☐ |
| 3 | Edit period | Tap existing, change flow | Period updated | ☐ |
| 4 | Delete period | Swipe, confirm delete | Period removed from list/calendar | ☐ |
| 5 | Invalid dates | Set end before start | Validation error shown | ☐ |
| 6 | Cycle prediction | Log 3+ periods | Next period date predicted | ☐ |
| 7 | Cycle day display | After logging period | Shows "Day X of cycle" | ☐ |
| 8 | Average cycle length | Log multiple periods | Correct average calculated | ☐ |
| 9 | Average duration | Log multiple periods | Correct average calculated | ☐ |
| 10 | History list | Log 5 periods | All 5 shown in history | ☐ |
| 11 | Empty state | New user, no periods | "No periods logged" message | ☐ |
| 12 | Data persistence | Log period, restart app | Period still visible | ☐ |

---

## Sprint 3 Deliverables Checklist
- [ ] Period API endpoints working
- [ ] Period tracking screen complete
- [ ] Period history screen complete
- [ ] Period service with helpers
- [ ] Cycle predictions working
- [ ] All test cases passing
- [ ] Code reviewed and merged
- [ ] Sprint demo ready
