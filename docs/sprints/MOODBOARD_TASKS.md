# Moodboard Feature - Implementation Tasks

**Reference:** [MOODBOARD_FEATURE_PLAN.md](./MOODBOARD_FEATURE_PLAN.md)

---

## Phase 1: Backend - Feedback Types & Model

### Task 1.1: Create Feedback Types
**File:** `backend/src/models/feedback.types.ts`

```typescript
// Create this file with:
// - FeedbackType: 'good' | 'bad' | 'improve'
// - RecommendationType: 'breathing' | 'exercise' | 'activity' | 'affirmation'
// - RecommendationFeedback interface
// - CreateFeedbackData interface
// - FeedbackStats interface
```

**Command:** Ask Kiro to create `backend/src/models/feedback.types.ts`

---

### Task 1.2: Create Feedback Model
**File:** `backend/src/models/feedback.model.ts`

```typescript
// Create this file with:
// - getFeedbackCollection() function
// - initializeFeedbackCollections() for indexes
```

**Command:** Ask Kiro to create `backend/src/models/feedback.model.ts`

---

## Phase 2: Backend - Mood Recommendation Service

### Task 2.1: Create Mood Recommendation Service
**File:** `backend/src/services/mood-recommendation.service.ts`

```typescript
// Create this file with:
// - getMoodLabel(mood: number) helper
// - getTimeOfDay() helper
// - getFallbackRecommendations(mood: number) for AI failure
// - buildAIPrompt(mood, factors, feedbackHistory) function
// - getRecommendations(userId, mood, factors) main function
```

**Dependencies:** Task 1.1, Task 1.2, existing `ai.service.ts`

**Command:** Ask Kiro to create `backend/src/services/mood-recommendation.service.ts`

---

## Phase 3: Backend - Controller & Routes

### Task 3.1: Create Mood Controller
**File:** `backend/src/controllers/mood.controller.ts`

```typescript
// Create this file with handlers:
// - getRecommendations(req, res) - POST /api/moods/recommendations
// - submitFeedback(req, res) - POST /api/moods/feedback
// - getFeedbackStats(req, res) - GET /api/moods/feedback-stats
```

**Dependencies:** Task 2.1

**Command:** Ask Kiro to create `backend/src/controllers/mood.controller.ts`

---

### Task 3.2: Create Mood Routes
**File:** `backend/src/routes/mood.routes.ts`

```typescript
// Create this file with routes:
// - POST /recommendations
// - POST /feedback
// - GET /feedback-stats
```

**Dependencies:** Task 3.1

**Command:** Ask Kiro to create `backend/src/routes/mood.routes.ts`

---

### Task 3.3: Register Routes in App
**File:** `backend/src/app.ts`

```typescript
// Add to existing app.ts:
// import moodRoutes from './routes/mood.routes';
// app.use('/api/moods', authMiddleware, moodRoutes);
```

**Dependencies:** Task 3.2

**Command:** Ask Kiro to update `backend/src/app.ts` to add mood routes

---

## Phase 4: Backend Testing

### Task 4.1: Test API Endpoints
**Manual Testing:**

```bash
# Test recommendations endpoint
curl -X POST http://localhost:3000/api/moods/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"mood": 2, "factors": ["stress"]}'

# Test feedback endpoint
curl -X POST http://localhost:3000/api/moods/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"moodLevel": 2, "recommendationTitle": "4-7-8 Breathing", "recommendationType": "breathing", "feedback": "good"}'

# Test feedback stats
curl http://localhost:3000/api/moods/feedback-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Phase 5: Frontend - Mood Service

### Task 5.1: Create Mood API Service
**File:** `frontend/my-expo-app/services/moodService.ts`

```typescript
// Create this file with:
// - getRecommendations(mood, factors)
// - submitFeedback(feedbackData)
// - getFeedbackStats()
```

**Dependencies:** Phase 4 complete (backend working)

**Command:** Ask Kiro to create `frontend/my-expo-app/services/moodService.ts`

---

## Phase 6: Frontend - Components

### Task 6.1: Create MoodSelector Component
**File:** `frontend/my-expo-app/components/mood/MoodSelector.tsx`

```typescript
// Create this file with:
// - 5 emoji buttons (😢 😔 😐 🙂 😄)
// - Selected state with animation
// - onMoodSelect callback prop
```

**Command:** Ask Kiro to create `frontend/my-expo-app/components/mood/MoodSelector.tsx`

---

### Task 6.2: Create RecommendationCard Component
**File:** `frontend/my-expo-app/components/mood/RecommendationCard.tsx`

```typescript
// Create this file with:
// - Card with icon, title, description, duration
// - Expandable steps section
// - Feedback buttons (👍 👎 💡)
// - onFeedback callback prop
```

**Dependencies:** Task 6.1

**Command:** Ask Kiro to create `frontend/my-expo-app/components/mood/RecommendationCard.tsx`

---

### Task 6.3: Create FeedbackModal Component
**File:** `frontend/my-expo-app/components/mood/FeedbackModal.tsx`

```typescript
// Create this file with:
// - Modal with 3 feedback options
// - Optional comment input for "improve"
// - Submit and Skip buttons
// - onSubmit and onClose callbacks
```

**Dependencies:** Task 6.2

**Command:** Ask Kiro to create `frontend/my-expo-app/components/mood/FeedbackModal.tsx`

---

## Phase 7: Frontend - Main Screen

### Task 7.1: Create MoodboardScreen
**File:** `frontend/my-expo-app/screens/MoodboardScreen.tsx`

```typescript
// Create this file with:
// - MoodSelector at top
// - Factor selection chips (optional)
// - Loading state while fetching recommendations
// - List of RecommendationCards
// - FeedbackModal integration
```

**Dependencies:** Task 5.1, Task 6.1, Task 6.2, Task 6.3

**Command:** Ask Kiro to create `frontend/my-expo-app/screens/MoodboardScreen.tsx`

---

### Task 7.2: Add to Navigation
**File:** Update navigation files

```typescript
// Add MoodboardScreen to navigation stack
// Add tab or menu item for Moodboard
```

**Dependencies:** Task 7.1

**Command:** Ask Kiro to add MoodboardScreen to navigation

---

## Quick Reference - Task Order

```
1.1 → 1.2 → 2.1 → 3.1 → 3.2 → 3.3 → 4.1 (Backend Complete)
                                      ↓
5.1 → 6.1 → 6.2 → 6.3 → 7.1 → 7.2 (Frontend Complete)
```

---

## How to Run Each Task

1. Copy the task description
2. Tell Kiro: "Complete Task X.X: [task name]"
3. Review the generated code
4. Test if applicable
5. Mark task as complete below

---

## Progress Tracker

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Create Feedback Types | ✅ |
| 1.2 | Create Feedback Model | ✅ |
| 2.1 | Create Mood Recommendation Service | ✅ |
| 3.1 | Create Mood Controller | ✅ |
| 3.2 | Create Mood Routes | ✅ |
| 3.3 | Register Routes in App | ✅ |
| 4.1 | Test API Endpoints | ⏳ |
| 5.1 | Create Mood API Service | ✅ |
| 6.1 | Create MoodSelector Component | ✅ |
| 6.2 | Create RecommendationCard Component | ✅ |
| 6.3 | Create FeedbackModal Component | ✅ |
| 7.1 | Create MoodboardScreen | ✅ |
| 7.2 | Add to Navigation | ✅ |

---

**Start with:** "Complete Task 1.1: Create Feedback Types"
