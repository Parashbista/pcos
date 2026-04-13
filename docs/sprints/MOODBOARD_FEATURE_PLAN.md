# Moodboard Feature Plan
**Feature:** AI-Powered Mood-Based Personalized Recommendations  
**Status:** Planning  
**Created:** December 30, 2025

---

## 📋 Overview

User le app kholera aafno current mood select garcha. App le existing AI service (Gemini/OpenAI/Anthropic) use garera mood analyze garcha ra personalized recommendations generate garcha - jastai stressed cha bhane stress relief exercises, sad cha bhane uplifting activities, etc.

### Core Flow
```
User opens app → Taps current mood → AI analyzes mood + context → AI generates personalized recommendations → Shows recommendation cards
```

---

## 🎯 User Stories

1. **As a user**, I want to quickly log my current mood so the app understands how I'm feeling
2. **As a user**, I want to receive AI-generated personalized recommendations based on my mood
3. **As a user**, I want recommendations that consider my mood factors (stress, sleep, etc.)
4. **As a user**, I want varied and contextual suggestions, not repetitive static content
5. **As a user**, I want to give feedback on recommendations so the app learns my preferences
6. **As a user**, I want future recommendations to improve based on my past feedback

---

## 🤖 AI Integration

### Existing AI Service
Project ma already flexible AI service cha (`backend/src/services/ai.service.ts`) with support for:
- **Gemini** (default)
- **OpenAI** 
- **Anthropic (Claude)**

### AI Prompt Strategy
AI lai mood + factors pathauney, AI le JSON format ma recommendations return garcha:

```typescript
// Example AI Prompt
const prompt = `
You are a wellness assistant for a PCOS health app. 
User's current mood: ${mood}/5 (${moodLabel})
Contributing factors: ${factors.join(', ')}
Time of day: ${timeOfDay}

Generate 3-4 personalized wellness recommendations. Include a mix of:
- Breathing/relaxation exercises
- Physical activities
- Mental wellness activities  
- Positive affirmations

Return JSON format:
{
  "message": "empathetic message for user",
  "recommendations": [
    {
      "type": "breathing|exercise|activity|affirmation",
      "title": "short title",
      "description": "brief description",
      "duration": "X minutes (if applicable)",
      "steps": ["step 1", "step 2"] (if applicable)
    }
  ]
}
`;
```

### AI Response Handling
- Use `aiService.generateJSON()` for structured responses
- Fallback to hardcoded recommendations if AI fails
- Cache recent recommendations to reduce API calls
- Include user's positive feedback history in prompts for better personalization

---

## 🔄 Feedback & Learning System

### Overview
User le recommendation complete garepachi feedback dincha (👍 Good / 👎 Bad / 💡 Needs Improvement). Yo feedback store huncha ra future AI prompts ma include huncha - AI le user ko preferences sikcha.

### Feedback Flow
```
User sees recommendation → Tries it → Gives feedback (Good/Bad/Improve) 
→ Feedback stored in DB → Next time AI prompt includes past feedback 
→ AI generates better personalized recommendations
```

### Feedback Types

| Feedback | Value | Meaning | AI Learning |
|----------|-------|---------|-------------|
| 👍 Good | `good` | Recommendation was helpful | Include similar recommendations |
| 👎 Bad | `bad` | Recommendation didn't help | Avoid similar recommendations |
| 💡 Improve | `improve` | Partially helpful, needs tweaking | User can add comment for context |

### Feedback Data Model
```typescript
interface RecommendationFeedback {
  id: string;
  odId: string;
  odLevel: number;
  recommendationTitle: string;
  recommendationType: 'breathing' | 'exercise' | 'activity' | 'affirmation';
  feedback: 'good' | 'bad' | 'improve';
  comment?: string;  // Optional user comment for 'improve' feedback
  moodFactors: string[];  // What factors were present
  createdAt: Date;
}
```

### AI Prompt with Feedback Context
```typescript
const prompt = `
You are a wellness assistant for a PCOS health app. 
User's current mood: ${mood}/5 (${moodLabel})
Contributing factors: ${factors.join(', ')}
Time of day: ${timeOfDay}

USER PREFERENCE HISTORY (learn from this):
Liked recommendations: ${goodFeedback.map(f => f.recommendationTitle).join(', ')}
Disliked recommendations: ${badFeedback.map(f => f.recommendationTitle).join(', ')}
Improvement suggestions: ${improveFeedback.map(f => `${f.recommendationTitle}: "${f.comment}"`).join('; ')}

Based on user's preferences, generate 3-4 personalized wellness recommendations.
- Prioritize types/styles similar to liked recommendations
- Avoid types/styles similar to disliked recommendations
- Consider improvement feedback for better suggestions

Return JSON format:
{
  "message": "empathetic message for user",
  "recommendations": [...]
}
`;
```

### Feedback Storage Strategy
- Store last 50 feedback entries per user (rolling window)
- Aggregate feedback stats: which types work best for which moods
- Use feedback to build user preference profile over time

---

## 📊 Mood Context for AI

| Mood | State | Emoji | AI Context |
|------|-------|-------|------------|
| 1 | Terrible | 😢 | "User is feeling terrible, needs gentle support and calming activities" |
| 2 | Bad | 😔 | "User is feeling down, needs uplifting but not overwhelming suggestions" |
| 3 | Okay | 😐 | "User is neutral, can handle moderate activities to boost energy" |
| 4 | Good | 🙂 | "User is feeling good, can maintain or enhance current state" |
| 5 | Great | 😄 | "User is feeling great, can take on challenges and celebrate" |

### Mood Factors (sent to AI)
- `stress` - Work/life stress
- `poor_sleep` - Sleep issues
- `hormonal` - PCOS-related hormonal changes
- `anxiety` - Feeling anxious
- `fatigue` - Low energy
- `pain` - Physical discomfort

---

## 🏗️ Technical Architecture

### Backend Components

#### 1. Mood Recommendation Service (AI-Powered)
**File:** `backend/src/services/mood-recommendation.service.ts`

```typescript
import { getAIService } from './ai.service';

interface Recommendation {
  type: 'breathing' | 'exercise' | 'activity' | 'affirmation';
  title: string;
  description: string;
  duration?: string;
  steps?: string[];
}

interface MoodRecommendationResponse {
  mood: number;
  moodLabel: string;
  message: string;
  recommendations: Recommendation[];
}

// Uses existing AI service to generate recommendations
async function getAIRecommendations(
  mood: number, 
  factors: string[]
): Promise<MoodRecommendationResponse>
```

#### 2. Mood Controller
**File:** `backend/src/controllers/mood.controller.ts`
- `getRecommendations` - Get AI-generated recommendations based on mood
- `logMoodWithRecommendations` - Log mood and get recommendations in one call

#### 3. Mood Routes
**File:** `backend/src/routes/mood.routes.ts`
- `POST /api/moods/recommendations` - Get AI recommendations for mood
- `POST /api/moods/log` - Log mood entry
- `POST /api/moods/feedback` - Submit feedback for a recommendation
- `GET /api/moods/history` - Get mood history
- `GET /api/moods/analytics` - Get mood analytics/patterns
- `GET /api/moods/feedback-stats` - Get user's feedback statistics

#### 4. Feedback Model
**File:** `backend/src/models/feedback.model.ts`
- Store recommendation feedback
- Query user's feedback history for AI context
- Aggregate feedback statistics

---

### Frontend Components

#### 1. MoodboardScreen
**File:** `frontend/my-expo-app/screens/MoodboardScreen.tsx`
- Main screen with mood selector
- Displays recommendation cards
- Quick access from home

#### 2. MoodSelector Component
**File:** `frontend/my-expo-app/components/mood/MoodSelector.tsx`
- 5 emoji buttons for mood selection
- Animated selection feedback
- Optional factor selection (stress, sleep, etc.)

#### 3. RecommendationCard Component
**File:** `frontend/my-expo-app/components/mood/RecommendationCard.tsx`
- Card displaying single recommendation
- Icon, title, description
- Expandable for steps/details
- "Start" or "Done" action button
- Feedback buttons (👍 👎 💡) after completion

#### 4. FeedbackModal Component
**File:** `frontend/my-expo-app/components/mood/FeedbackModal.tsx`
- Modal for detailed feedback
- Quick feedback buttons (Good/Bad/Improve)
- Optional comment input for "Improve" feedback
- Submit and skip options

#### 4. Mood Service
**File:** `frontend/my-expo-app/services/moodService.ts`
- API calls for mood endpoints
- Local caching of recommendations

---

## 📡 API Contracts

### POST /api/moods/recommendations
Get AI-generated personalized recommendations based on mood.

**Request:**
```json
{
  "mood": 2,
  "factors": ["stress", "poor_sleep"],
  "context": {
    "timeOfDay": "evening",
    "recentSymptoms": ["fatigue", "headache"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mood": 2,
    "moodLabel": "Bad",
    "message": "I understand you're having a tough day. Here are some gentle activities that might help you feel better:",
    "recommendations": [
      {
        "type": "breathing",
        "title": "4-7-8 Calming Breath",
        "description": "A soothing breathing technique to calm your nervous system and reduce stress",
        "duration": "3 minutes",
        "steps": [
          "Find a comfortable seated position",
          "Breathe in quietly through your nose for 4 seconds",
          "Hold your breath for 7 seconds",
          "Exhale completely through your mouth for 8 seconds",
          "Repeat this cycle 3-4 times"
        ]
      },
      {
        "type": "exercise",
        "title": "Gentle Evening Stretches",
        "description": "Light stretches to release tension from your day, especially helpful for fatigue",
        "duration": "5 minutes"
      },
      {
        "type": "activity",
        "title": "Gratitude Journaling",
        "description": "Write down 3 small things you're grateful for today - even tiny wins count"
      },
      {
        "type": "affirmation",
        "title": "Evening Affirmation",
        "description": "This difficult moment will pass. I am resilient, and tomorrow is a fresh start."
      }
    ],
    "aiGenerated": true,
    "provider": "gemini"
  }
}
```

**Note:** Recommendations are dynamically generated by AI based on mood, factors, and context. Each response will be unique and personalized.

### POST /api/moods/feedback
Submit feedback for a recommendation.

**Request:**
```json
{
  "moodLevel": 2,
  "recommendationTitle": "4-7-8 Calming Breath",
  "recommendationType": "breathing",
  "feedback": "good",
  "comment": null,
  "moodFactors": ["stress", "poor_sleep"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback recorded. We'll use this to improve your recommendations!",
  "data": {
    "feedbackId": "fb_123456",
    "totalFeedback": 15,
    "preferenceProfile": {
      "preferredTypes": ["breathing", "activity"],
      "avoidTypes": ["exercise"]
    }
  }
}
```

### GET /api/moods/feedback-stats
Get user's feedback statistics and preference profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFeedback": 25,
    "breakdown": {
      "good": 18,
      "bad": 4,
      "improve": 3
    },
    "byType": {
      "breathing": { "good": 8, "bad": 1 },
      "exercise": { "good": 3, "bad": 2 },
      "activity": { "good": 5, "bad": 1 },
      "affirmation": { "good": 2, "bad": 0 }
    },
    "topPreferences": ["breathing", "activity"],
    "recentFeedback": [...]
  }
}
```

### POST /api/moods/log
Log mood entry with optional recommendations.

**Request:**
```json
{
  "mood": 3,
  "factors": ["work"],
  "notes": "Busy day at work",
  "getRecommendations": true
}
```

---

## 📁 Files to Create/Modify

### New Files

| File | Description |
|------|-------------|
| `backend/src/services/mood-recommendation.service.ts` | AI-powered recommendation generation using existing AI service |
| `backend/src/controllers/mood.controller.ts` | API handlers for mood endpoints |
| `backend/src/routes/mood.routes.ts` | Route definitions |
| `backend/src/models/feedback.model.ts` | Feedback data model and queries |
| `backend/src/models/feedback.types.ts` | TypeScript types for feedback |
| `frontend/my-expo-app/screens/MoodboardScreen.tsx` | Main moodboard UI |
| `frontend/my-expo-app/components/mood/MoodSelector.tsx` | Mood picker component |
| `frontend/my-expo-app/components/mood/RecommendationCard.tsx` | Recommendation display with feedback |
| `frontend/my-expo-app/components/mood/FeedbackModal.tsx` | Feedback input modal |
| `frontend/my-expo-app/services/moodService.ts` | API service |

### Modify Files

| File | Changes |
|------|---------|
| `backend/src/app.ts` | Add mood routes |
| `frontend/my-expo-app/navigation/*` | Add MoodboardScreen to navigation |

---

## 🚀 Implementation Phases

### Phase 1: Backend AI Recommendation Service
- [ ] Create mood recommendation service that uses existing AI service
- [ ] Build AI prompt template for mood-based recommendations
- [ ] Add fallback recommendations if AI fails
- [ ] Create mood controller with getRecommendations handler
- [ ] Create mood routes and register in app
- [ ] Test API endpoint with different moods

### Phase 2: Backend Feedback System
- [ ] Create feedback types and data model
- [ ] Create feedback collection with indexes
- [ ] Add submitFeedback controller handler
- [ ] Add getFeedbackStats controller handler
- [ ] Update recommendation service to include feedback in AI prompts
- [ ] Test feedback storage and retrieval

### Phase 3: Frontend Mood Selection
- [ ] Create MoodboardScreen with basic layout
- [ ] Create MoodSelector component with 5 mood options
- [ ] Add optional factor selection (stress, sleep, etc.)
- [ ] Add mood selection animation/feedback
- [ ] Connect to API

### Phase 4: Recommendations & Feedback UI
- [ ] Create RecommendationCard component with feedback buttons
- [ ] Create FeedbackModal for detailed feedback
- [ ] Display AI-generated recommendations
- [ ] Add expandable details for steps
- [ ] Loading state while AI generates
- [ ] Error handling with fallback UI
- [ ] Feedback submission flow

### Phase 5: Integration & Polish
- [ ] Add to main navigation
- [ ] Integrate with existing mood logging
- [ ] Add mood history view
- [ ] Cache recent recommendations
- [ ] Show preference profile to user (optional)
- [ ] Analytics dashboard (optional)

---

## 🎨 UI/UX Design Notes

### MoodboardScreen Layout
```
┌─────────────────────────────┐
│  How are you feeling today? │
│                             │
│   😢  😔  😐  🙂  😄        │
│        [Selected: 😔]       │
│                             │
│  ─────────────────────────  │
│                             │
│  Here's what might help:    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🫁 4-7-8 Breathing  │    │
│  │ 3 min • Breathing   │    │
│  │                     │    │
│  │ [Done] 👍 👎 💡     │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 🧘 Gentle Stretches │    │
│  │ 5 min • Exercise    │    │
│  │                     │    │
│  │ [Done] 👍 👎 💡     │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

### Feedback Modal Layout
```
┌─────────────────────────────┐
│     How was this activity?  │
│                             │
│  "4-7-8 Calming Breath"     │
│                             │
│   👍        👎        💡    │
│  Good      Bad     Improve  │
│                             │
│  ┌───────────────────────┐  │
│  │ Any suggestions?      │  │
│  │ (optional)            │  │
│  └───────────────────────┘  │
│                             │
│  [Skip]          [Submit]   │
└─────────────────────────────┘
```

### Color Scheme (based on mood)
- Mood 1-2: Soft, calming colors (light blue, lavender)
- Mood 3: Neutral, balanced colors
- Mood 4-5: Warm, energetic colors (soft yellow, light green)

---

## ✅ Acceptance Criteria

- [ ] User can select mood from 5 options
- [ ] App calls AI service to generate personalized recommendations
- [ ] Recommendations are unique and contextual (not static)
- [ ] AI considers mood level, factors, and time of day
- [ ] Recommendations include breathing, exercise, activity types
- [ ] Each recommendation has title, description, and optional steps
- [ ] Fallback recommendations shown if AI fails
- [ ] Mood selection is saved to database
- [ ] UI shows loading state while AI generates
- [ ] Error states handled gracefully
- [ ] User can give feedback (Good/Bad/Improve) on each recommendation
- [ ] Feedback is stored in database with context
- [ ] AI prompts include user's feedback history
- [ ] Future recommendations improve based on past feedback
- [ ] User can optionally add comments for "Improve" feedback

---

## 📝 Notes

- Uses existing `ai.service.ts` - no new AI integration needed
- Leverage existing `mood.types.ts` and `mood.model.ts`
- AI generates fresh recommendations each time (can add caching later)
- Feedback system enables continuous learning and personalization
- Store last 50 feedback entries per user (rolling window for AI context)
- PCOS-specific context included in AI prompts for relevant suggestions
- Good feedback data helps AI understand what works for each user
- Bad feedback helps AI avoid unhelpful suggestions

---

## 🔧 AI Service Reference

Existing AI service location: `backend/src/services/ai.service.ts`

```typescript
// Usage example
import { getAIService } from './ai.service';

const aiService = getAIService();

// For JSON responses (recommended for recommendations)
const result = await aiService.generateJSON<RecommendationResponse>(prompt);

// For text responses
const result = await aiService.generate({ prompt, maxTokens: 1024 });
```

Supported providers (configured via .env):
- `AI_PROVIDER=gemini` (default)
- `AI_PROVIDER=openai`
- `AI_PROVIDER=anthropic`

---

**Ready for review!** Kun phase bata start garney bhannus.
