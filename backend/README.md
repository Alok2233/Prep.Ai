# Prep AI Backend (JavaScript)

Pure JavaScript (Node + Express) backend for the Prep AI project:

- Gemini 2.5 Flash (via @google/genai)
- MongoDB (via Mongoose)
- Routes:
  - /api/resume/analyze
  - /api/interview/start
  - /api/interview/answer
  - /api/insights/market
  - /api/dashboard/metrics

## Setup

```bash
cd prep-ai-backend-js
cp .env.example .env   # fill GEMINI_API_KEY and MONGODB_URI
npm install
npm run dev
```

Server will run on http://localhost:4000 by default.
