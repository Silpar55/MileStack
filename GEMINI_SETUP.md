# Gemini AI Setup for Milestack

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/milestack"

# Gemini AI API (Required for AI analysis)
GEMINI_API_KEY="your_gemini_api_key_here"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Base URL for API calls
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" in the left sidebar
4. Create a new API key
5. Copy the API key and add it to your `.env.local` file as `GEMINI_API_KEY`

## Gemini AI Features Used

- **Model**: `gemini-1.0-pro` (fast and efficient)
- **Temperature**: 0.3 (balanced creativity and consistency)
- **Max Tokens**: 2000 (sufficient for analysis responses)
- **Free Tier**: 15 requests per minute, 1 million tokens per day

## API Usage

The system uses Gemini AI for:

- Programming concept extraction
- Difficulty level assessment
- Learning pathway generation
- Milestone creation with competency requirements
- Prerequisite identification
- Learning gap detection

## Fallback System

If Gemini AI is unavailable or fails, the system automatically falls back to a basic keyword-based analysis system that still provides meaningful learning pathways.
