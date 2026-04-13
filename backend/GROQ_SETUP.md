# Groq API Setup (FREE Alternative)

Groq provides FREE, fast AI inference with excellent models like Llama 3.3.

## Get Your Free API Key

1. Go to: **https://console.groq.com/**
2. Sign up with Google/GitHub (takes 30 seconds)
3. Click **"API Keys"** in the left sidebar
4. Click **"Create API Key"**
5. Copy your key (starts with `gsk_...`)

## Update Your .env File

```env
AI_PROVIDER=groq
AI_API_KEY=gsk_your_key_here
AI_MODEL=llama-3.3-70b-versatile
```

## Available Free Models

- `llama-3.3-70b-versatile` - Best overall (recommended)
- `llama-3.1-70b-versatile` - Fast and capable
- `mixtral-8x7b-32768` - Good for longer contexts
- `gemma2-9b-it` - Lightweight and fast

## Test Your Setup

Run: `node test-groq.js`

## Free Tier Limits

- 30 requests per minute
- 14,400 requests per day
- More than enough for development and small apps!
