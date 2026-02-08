# Quick Setup Guide

## One-Time Setup

1. **Get AssemblyAI API Key** (Required)
   - Visit: https://www.assemblyai.com/
   - Sign up for free account (3 hours of transcription per month)
   - Copy your API key from the dashboard

2. **Backend Setup**
   ```powershell
   cd backend
   npm install
   npm install @vitalets/google-translate-api
   Copy-Item .env.example .env
   # Edit .env and add your ASSEMBLYAI_API_KEY
   ```

## Running the Application

Open two terminal windows:

**Terminal 1 - Backend Server:**
```powershell
cd c:\Work\youtube-subtitle-generator\backend
npm start
```
Wait for: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend Development Server:**
```powershell
cd c:\Work\youtube-subtitle-generator\frontend
npm install
npm run dev
```

Open: http://localhost:3000

## Quick Test

1. Use this test video: `https://www.youtube.com/watch?v=8wysIxzqgPI`
2. Select **Video Language** (the language spoken in the video)
3. Select **Subtitle Language** (the language you want for subtitles)
4. Click "Generate Subtitles"
5. Wait 1-2 minutes for processing (downloads video locally)
6. Video will play with subtitles!

## Supported Languages

- **English** 🇬🇧 - Full transcription and translation
- **Spanish** 🇪🇸 - Full transcription and translation
- **Hindi** 🇮🇳 - Full transcription and translation
- **Chinese** 🇨🇳 - Full transcription and translation

You can transcribe a video in any supported language and generate subtitles in any other supported language!

## Common Issues

**"Cannot find module"**
- Run `npm install` in both backend and frontend directories

**"API key not configured"**
- Make sure you created `.env` file in backend folder
- Add your AssemblyAI API key to the file

**"Port already in use"**
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.js`

**Video won't play**
- Make sure both servers are running
- Check browser console for errors
- Try a different YouTube video (some videos are restricted)

## File Locations

- Backend code: `backend/`
- Frontend code: `frontend/src/`
- Temporary files: `backend/temp/` (auto-cleaned)
- Environment config: `backend/.env`

## Next Steps

- Read the full README.md for detailed documentation
- Explore the code in `backend/services/` and `frontend/src/components/`
- Try transcribing videos in different languages (Spanish, Hindi, Chinese)
- Try translating between any language pair
- Customize the UI in `frontend/src/App.jsx`
- Adjust language mappings in `backend/services/transcriptionService.js`
