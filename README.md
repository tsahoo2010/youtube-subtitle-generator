# YouTube Subtitle Generator

A full-stack application that generates and translates subtitles for YouTube videos using AI-powered speech recognition. The application extracts audio from YouTube videos, transcribes it using AssemblyAI, translates subtitles into multiple languages, and displays them overlaid on the video player.

## Features

- ✅ Extract audio from YouTube videos
- ✅ Generate subtitles using AI speech-to-text (AssemblyAI)
- ✅ Translate subtitles into multiple languages:
  - English (direct transcription)
  - Spanish (via Google Translate)
  - Hindi (via Google Translate)
- ✅ Download YouTube videos locally to bypass embedding restrictions
- ✅ Display subtitles synced with local video playback
- ✅ Modern, responsive UI with Video.js player
- ✅ Real-time subtitle language switching
- ✅ Support for WebVTT subtitle format
- ✅ Error handling for invalid or private videos

## Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **yt-dlp** - YouTube video downloader (Python-based CLI tool)
- **AssemblyAI** - AI-powered speech-to-text transcription
- **Google Translate API** - Free translation service (@vitalets/google-translate-api)
- **Python 3.12** - Required for yt-dlp
- **FFmpeg** - Audio/video processing

### Frontend
- **HTML5 + JavaScript** - Simple, standalone web interface
- **HTML5 Video Element** - Native video player with subtitle support
- **WebVTT** - Web Video Text Tracks for subtitle format
- **Python HTTP Server** - Serves static files for development

## Project Structure

```
youtube-subtitle-generator/
├── backend/
│   ├── services/
│   │   ├── transcriptionService.js    # AssemblyAI integration
│   │   ├── translationService.js      # Google Translate integration
│   │   └── videoService.js            # YouTube video/audio download with yt-dlp
│   ├── routes/
│   │   └── videoRoutes.js             # API endpoints
│   ├── utils/
│   │   └── subtitleUtils.js           # Subtitle formatting (WebVTT)
│   ├── temp/                          # Temporary files (videos, subtitles)
│   │   ├── app.html                   # Main web interface
│   │   ├── video-with-subtitles.html  # Simple video player
│   │   ├── download-video.bat         # Batch script for manual downloads
│   │   └── *.vtt                      # Generated subtitle files
│   ├── server.js                      # Express server
│   ├── package.json
│   └── .env
│
└── frontend/                          # (Legacy React app - not actively used)
```

## Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python 3.12** or higher
- **yt-dlp** (Python package)
- **FFmpeg** (for audio conversion)
- **AssemblyAI API key** (free tier available)

### Step 1: Install System Requirements

#### Windows (using winget):
```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Python
winget install Python.Python.3.12

# Install FFmpeg
winget install Gyan.FFmpeg

# Install yt-dlp via pip
pip install yt-dlp
```

### Step 2: Clone and Install Dependencies

```powershell
# Navigate to the project directory
cd c:\Work\youtube-subtitle-generator

# Install backend dependencies
cd backend
npm install

# Install Google Translate package
npm install @vitalets/google-translate-api
```

### Step 3: Configure Environment Variables

1. Copy the example environment file in the backend:

```powershell
cd ..\backend
Copy-Item .env.example .env
```

2. Edit the `.env` file and add your AssemblyAI API key:

```env
PORT=3001

# Get your free API key from: https://www.assemblyai.com/
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Temporary file storage
TEMP_DIR=./temp
```

### Step 3: Get AssemblyAI API Key

1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Paste it in the `.env` file

### Step 4: Start the Application

**Terminal 1 - Start Backend Server:**
```powershell
cd c:\Work\youtube-subtitle-generator\backend
npm start
```

**Terminal 2 - Start HTTP Server (for UI):**
```powershell
cd c:\Work\youtube-subtitle-generator\backend\temp
python -m http.server 8000
```

The application will be available at:
- **Web Interface**: http://localhost:8000/app.html
- **Backend API**: http://localhost:3001

## Usage

1. **Open Web Interface**: Navigate to http://localhost:8000/app.html
2. **Enter YouTube URL**: Paste any public YouTube video URL into the input field
3. **Select Language**: Choose your preferred subtitle language:
   - English (original transcription)
   - Spanish (Google Translated)
   - Hindi (Google Translated)
4. **Generate Subtitles**: Click "Generate Subtitles" button
5. **Wait for Processing**: The app will:
   - Download video file locally (~19MB for typical video)
   - Extract and download audio
   - Transcribe audio to English text using AssemblyAI
   - Translate to selected language (if not English) using Google Translate
   - Generate time-synced WebVTT subtitle file
6. **Watch Video**: Video plays locally with subtitles overlaid automatically
7. **Try Different Languages**: Select a different language and regenerate to see translated subtitles

## API Endpoints

### GET /api/health
Health check endpoint
```json
{
  "status": "ok",
  "message": "YouTube Subtitle Generator API is running"
}
```

### POST /api/video/info
Get video information
```json
Request:
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

Response:
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Video Title",
    "duration": 213,
    "thumbnail": "https://...",
    "author": "Channel Name"
  }
}
```

### POST /api/video/generate-subtitles-local
Download video locally and generate subtitles
```json
Request:
{
  "url": "https://www.youtube.com/watch?v=8wysIxzqgPI",
  "language": "spanish"
}

Response:
{
  "success": true,
  "data": {
    "videoId": "8wysIxzqgPI",
    "title": "Video Title",
    "language": "spanish",
    "subtitleUrl": "/subtitles/abc123_spanish.vtt",
    "videoUrl": "/videos/abc123.mp4",
    "subtitleCount": 45,
    "warning": null  // or "Translation to spanish failed. Showing English subtitles instead."
  }
}
```

### GET /api/video/languages
Get available translation languages
```json
Response:
{
  "success": true,
  "data": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    { "code": "hi", "name": "Hindi" }
  ]
}
```

## How It Works

### Architecture Flow

```
┌─────────────────┐
│  User Browser   │
│  (app.html)     │
└────────┬────────┘
         │ 1. Submit YouTube URL + Language
         ▼
┌─────────────────────────────────────────┐
│      Node.js Backend (Express)          │
│  ┌───────────────────────────────────┐  │
│  │  videoService.js                  │  │
│  │  • downloadVideo() - yt-dlp       │  │
│  │  • downloadAudio() - yt-dlp       │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│              ▼                           │
│  ┌───────────────────────────────────┐  │
│  │  transcriptionService.js          │  │
│  │  • Upload audio to AssemblyAI     │  │
│  │  • Transcribe → English subtitles │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│              ▼                           │
│  ┌───────────────────────────────────┐  │
│  │  translationService.js            │  │
│  │  • translateWithGoogle()          │  │
│  │  • Batch translate subtitles      │  │
│  │  • Fallback: English if fails     │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│              ▼                           │
│  ┌───────────────────────────────────┐  │
│  │  Generate WebVTT File             │  │
│  │  • Save to temp/ directory        │  │
│  │  • Return URLs to frontend        │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │ 2. Return video + subtitle URLs
                  ▼
         ┌─────────────────┐
         │  HTML5 Video    │
         │  + Subtitle     │
         │  Overlay        │
         └─────────────────┘
```

### Key Technologies

**1. yt-dlp (Video Downloader)**
- Downloads YouTube videos in MP4 format
- Extracts audio as MP3 for transcription
- Handles various quality options and formats

**2. AssemblyAI (Speech Recognition)**
- Uploads audio file to cloud API
- Uses advanced AI models for accurate transcription
- Returns timestamped text segments
- Supports English language recognition

**3. Google Translate API (Translation)**
- Free translation service (unofficial API)
- Translates subtitle text to Spanish/Hindi
- Batch processing for efficiency (5 subtitles at a time)
- Automatic fallback to English if translation fails

**4. WebVTT Format (Subtitles)**
- Standard web subtitle format
- Contains timestamp + text pairs
- Example:
  ```
  WEBVTT

  00:00:00.000 --> 00:00:03.500
  Alright, so here we are in front of the elephants.
  ```

## Key Design Decisions

### 1. **AssemblyAI for Transcription**
- **Why**: Excellent accuracy, generous free tier, automatic punctuation, speaker detection
- **Alternative**: OpenAI Whisper (requires more setup, local processing)

### 2. **Google Translate for Translation**
- **Why**: Free, reliable, good quality for most language pairs, no API key required
- **How**: Uses @vitalets/google-translate-api (unofficial wrapper)
- **Alternative**: DeepL API (better quality, paid), LibreTranslate (free but less reliable)
- **Fallback**: Shows English subtitles if translation fails

### 3. **Local Video Download vs Streaming**
- **Decision**: Download videos locally instead of streaming
- **Why**: 
  - Bypasses YouTube embedding restrictions (Error 101/150)
  - Works for videos that block iframe embedding
  - Allows offline playback after download
- **Trade-off**: Requires storage space, longer initial load time

### 4. **HTML5 Video Player vs Video.js**
- **Decision**: Use native HTML5 video element with JavaScript subtitle overlay
- **Why**: 
  - Simpler, no external dependencies
  - Full control over subtitle rendering
  - Lightweight and fast
- **Trade-off**: Less features than Video.js (no quality switching, advanced controls)

### 5. **WebVTT Format**
- **Why**: Native browser support, better than SRT for web
- **Features**: Styling support, cue settings, positioning

### 6. **Modular Service Architecture**
- Separate services for video, transcription, and translation
- Easy to swap implementations (e.g., switch translation provider)
- Testable and maintainable

### 7. **Temporary File Management**
- Videos and subtitles stored in temp/ directory
- UUID-based filenames to prevent conflicts
- Manual cleanup (can add auto-cleanup later)

## Troubleshooting

### Issue: "AssemblyAI API key is not configured"
**Solution**: Make sure you've added your API key to the `.env` file in the backend directory.

### Issue: "Failed to download audio"
**Possible causes**:
- Video is private or restricted
- Video is age-restricted
- Network connectivity issues
**Solution**: Try a different public video or check your internet connection.

### Issue: Translation not working
**Possible causes**:
- Google Translate API rate limiting or blocked
- Network connectivity issues
**Solution**: 
- Translation automatically falls back to English subtitles
- Check browser console for specific error messages
- Video will still play with English subtitles

### Issue: Subtitles not appearing on video
**Possible causes**:
- CORS issues
- Subtitle file not generated
- Video and subtitle paths incorrect
**Solution**: 
- Check browser console for errors
- Ensure backend is running on port 3001
- Verify HTTP server is serving from backend/temp directory
- Check that subtitle .vtt file exists in backend/temp/

### Issue: Video player not loading
**Solution**: 
- Ensure Python HTTP server is running on port 8000
- Check that app.html exists in backend/temp directory
- Verify backend API is accessible at http://localhost:3001
- Check browser console for JavaScript errors

## Production Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables in your hosting platform
2. Ensure temp directory is writable
3. Consider using cloud storage (S3, CloudFlare R2) for video and subtitle files
4. Add rate limiting for API endpoints
5. Enable HTTPS
6. Ensure yt-dlp and FFmpeg are installed on the server

### Frontend Deployment

The frontend is a simple HTML file. You can:
1. Deploy `backend/temp/app.html` to any static hosting (Netlify, Vercel, GitHub Pages)
2. Update the API base URL in the JavaScript fetch calls to your backend URL
3. Or serve it directly from the backend via Express static middleware

### Environment Variables for Production

```env
# Backend
PORT=3001
ASSEMBLYAI_API_KEY=your_production_api_key
NODE_ENV=production
TEMP_DIR=./temp
```

## Limitations

- **Video Length**: Very long videos (>2 hours) may take significant time to process and consume storage
- **Rate Limits**: Free tier of AssemblyAI has monthly usage limits
- **Translation Quality**: Google Translate quality varies by language pair and context
- **Translation Availability**: Google Translate may be blocked or rate-limited; falls back to English
- **Private Videos**: Cannot process private, age-restricted, or geo-blocked videos
- **Live Streams**: Not supported
- **Storage**: Downloaded videos consume disk space (typically 10-30MB per video)

## Future Enhancements

- [ ] Auto-cleanup of old videos and subtitles
- [ ] Download subtitles as SRT/VTT files (download button)
- [ ] Support for more languages (French, German, Portuguese, etc.)
- [ ] Improved translation with DeepL API integration
- [ ] Speaker diarization (identify different speakers)
- [ ] Custom subtitle styling (font, size, color, position)
- [ ] Batch processing of multiple videos
- [ ] User accounts and saved videos history
- [ ] Support for video upload (not just YouTube)
- [ ] Edit generated subtitles before translation
- [ ] Caching of generated subtitles to avoid re-processing
- [ ] Progress bar for video download and transcription
- [ ] Support for playlists

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Credits

- [AssemblyAI](https://www.assemblyai.com/) - Speech-to-text transcription API
- [Google Translate](https://translate.google.com/) - Translation service via [@vitalets/google-translate-api](https://github.com/vitalets/google-translate-api)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube video/audio downloader
- [FFmpeg](https://ffmpeg.org/) - Audio/video processing

## Support

For issues or questions, please check:
1. This README troubleshooting section
2. Console logs for detailed error messages
3. AssemblyAI documentation for transcription issues
4. Video.js documentation for player issues

---

**Happy subtitle generating! 🎬📝**
