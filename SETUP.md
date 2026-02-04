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

**Terminal 2 - HTTP Server (for UI):**
```powershell
cd c:\Work\youtube-subtitle-generator\backend\temp
python -m http.server 8000
```

Open: http://localhost:8000/app.html

## Quick Test

1. Use this test video: `https://www.youtube.com/watch?v=8wysIxzqgPI`
2. Select language (English, Spanish, or Hindi)
3. Click "Generate Subtitles"
4. Wait 1-2 minutes for processing (downloads video locally)
5. Video will play with subtitles!

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
- Try different languages: Spanish, Hindi, Chinese
- Customize the UI in `frontend/src/App.jsx`
