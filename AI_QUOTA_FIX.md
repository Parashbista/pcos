# AI Quota Exceeded - Solutions

## What Happened?
Your Google Gemini API has exceeded its free tier quota. This happens when you make too many requests in a short period.

## Quick Fixes (In Order of Recommendation)

### 1. Get a New Gemini API Key (FREE - Best Solution)

**Option A: Create New Key with Same Account**
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the new key
4. Replace `AI_API_KEY` in `backend/.env`
5. Restart backend server

**Option B: Use Different Google Account**
1. Sign out from Google AI Studio
2. Sign in with a different Google account
3. Create a new API key
4. Replace in `.env`

### 2. Wait for Quota Reset
- Free tier quotas reset every 24 hours
- Check your usage: https://ai.google.dev/gemini-api/docs/rate-limits
- Current wait time shown in error: ~45 seconds to 24 hours

### 3. Try Different Model (Already Applied)
I've changed your model from `gemini-2.0-flash` to `gemini-1.5-flash` which may have a separate quota.

Restart your backend to apply:
```cmd
cd backend
npm run dev
```

### 4. Fallback Responses (Already Implemented)
Your chatbot now provides helpful fallback responses when quota is exceeded, so users still get value.

## Alternative: Use OpenAI (Paid but Reliable)

If you need more reliability, consider OpenAI:

1. Get API key from: https://platform.openai.com/api-keys
2. Update your `.env`:
```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-key-here
AI_MODEL=gpt-3.5-turbo
```
3. Restart backend

Cost: ~$0.002 per request (very affordable for development)

## Current Status

✅ Connection issue FIXED - App now connects to backend
✅ Fallback responses ADDED - Chatbot still works during quota issues
✅ Model changed to gemini-1.5-flash
⚠️ Need new API key for full functionality

## Next Steps

1. Get a new Gemini API key (free)
2. Update `backend/.env` with new key
3. Restart backend server
4. Test the chatbot

Your app is now working, just with limited AI responses until you get a new key!
