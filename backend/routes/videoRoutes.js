import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import videoService from '../services/videoService.js';
import transcriptionService from '../services/transcriptionService.js';
import translationService from '../services/translationService.js';
import { toWebVTT, parseVideoId, isValidYouTubeUrl } from '../utils/subtitleUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/video/info
 * Get video information
 */
router.post('/info', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoInfo = await videoService.getVideoInfo(url);

    if (videoInfo.isPrivate) {
      return res.status(403).json({ error: 'Video is private and cannot be accessed' });
    }

    if (videoInfo.isLiveContent) {
      return res.status(400).json({ error: 'Live videos are not supported' });
    }

    res.json({
      success: true,
      data: videoInfo
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/video/generate-subtitles
 * Generate subtitles for a video
 */
router.post('/generate-subtitles', async (req, res, next) => {
  let audioPath = null;

  try {
    const { url, language = 'english' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info
    console.log('📹 Getting video information...');
    const videoInfo = await videoService.getVideoInfo(url);

    if (videoInfo.isPrivate) {
      return res.status(403).json({ error: 'Video is private and cannot be accessed' });
    }

    // Download audio
    console.log('🎵 Extracting audio from video...');
    const { audioId, audioPath: downloadedAudioPath } = await videoService.downloadAudio(url);
    audioPath = downloadedAudioPath;

    // Transcribe audio
    console.log('🎙️ Transcribing audio...');
    const { fullText, subtitles } = await transcriptionService.transcribeAudio(audioPath);

    // Translate if needed
    let finalSubtitles = subtitles;
    if (language.toLowerCase() !== 'english') {
      console.log(`🌐 Translating to ${language}...`);
      finalSubtitles = await translationService.translateSubtitles(
        subtitles,
        language,
        'english'
      );
    }

    // Generate WebVTT file
    const vttContent = toWebVTT(finalSubtitles);
    const vttFileName = `${audioId}_${language}.vtt`;
    const vttPath = path.join(path.dirname(__filename), '..', 'temp', vttFileName);
    fs.writeFileSync(vttPath, vttContent);

    // Clean up audio file
    videoService.cleanupFile(audioPath);

    res.json({
      success: true,
      data: {
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        language: language,
        subtitleUrl: `/subtitles/${vttFileName}`,
        subtitleCount: finalSubtitles.length,
        transcription: fullText
      }
    });

  } catch (error) {
    // Clean up on error
    if (audioPath) {
      videoService.cleanupFile(audioPath);
    }
    next(error);
  }
});

/**
 * POST /api/video/generate-subtitles-local
 * Generate subtitles and download video for local playback
 */
router.post('/generate-subtitles-local', async (req, res, next) => {
  let audioPath = null;
  let videoPath = null;

  try {
    const { url, language = 'english' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info
    console.log('📹 Getting video information...');
    const videoInfo = await videoService.getVideoInfo(url);

    if (videoInfo.isPrivate) {
      return res.status(403).json({ error: 'Video is private and cannot be accessed' });
    }

    // Download video
    console.log('🎬 Downloading video for local playback...');
    const { videoId: downloadVideoId, videoPath: downloadedVideoPath } = await videoService.downloadVideo(url);
    videoPath = downloadedVideoPath;

    // Download audio for transcription
    console.log('🎵 Extracting audio for transcription...');
    const { audioId, audioPath: downloadedAudioPath } = await videoService.downloadAudio(url);
    audioPath = downloadedAudioPath;

    // Transcribe audio
    console.log('🎙️ Transcribing audio...');
    const { fullText, subtitles } = await transcriptionService.transcribeAudio(audioPath);

    // Translate if needed
    let finalSubtitles = subtitles;
    let translationWarning = null;
    if (language.toLowerCase() !== 'english') {
      console.log(`🌐 Translating to ${language}...`);
      try {
        finalSubtitles = await translationService.translateSubtitles(
          subtitles,
          language,
          'english'
        );
      } catch (error) {
        console.error(`⚠️ Translation failed: ${error.message}`);
        console.log(`📝 Using English subtitles as fallback`);
        translationWarning = `Translation to ${language} failed. Showing English subtitles instead.`;
        // Keep English subtitles as fallback
        finalSubtitles = subtitles;
      }
    }

    // Generate WebVTT file
    const vttContent = toWebVTT(finalSubtitles);
    const vttFileName = `${audioId}_${language}.vtt`;
    const vttPath = path.join(path.dirname(__filename), '..', 'temp', vttFileName);
    fs.writeFileSync(vttPath, vttContent);

    // Clean up audio file (we only need the video now)
    videoService.cleanupFile(audioPath);

    const videoFileName = path.basename(videoPath);

    res.json({
      success: true,
      data: {
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        language: language,
        subtitleUrl: `/subtitles/${vttFileName}`,
        videoUrl: `/videos/${videoFileName}`,
        subtitleCount: finalSubtitles.length,
        transcription: fullText,
        warning: translationWarning
      }
    });

  } catch (error) {
    // Clean up on error
    if (audioPath) {
      videoService.cleanupFile(audioPath);
    }
    if (videoPath) {
      videoService.cleanupFile(videoPath);
    }
    next(error);
  }
});

/**
 * POST /api/video/translate-subtitles
 * Translate existing subtitles to another language
 */
router.post('/translate-subtitles', async (req, res, next) => {
  try {
    const { subtitles, targetLanguage, sourceLanguage = 'english' } = req.body;

    if (!subtitles || !Array.isArray(subtitles)) {
      return res.status(400).json({ error: 'Subtitles array is required' });
    }

    if (!targetLanguage) {
      return res.status(400).json({ error: 'Target language is required' });
    }

    // Translate subtitles
    const translatedSubtitles = await translationService.translateSubtitles(
      subtitles,
      targetLanguage,
      sourceLanguage
    );

    // Generate WebVTT file
    const vttContent = toWebVTT(translatedSubtitles);
    const vttFileName = `translated_${Date.now()}_${targetLanguage}.vtt`;
    const vttPath = path.join(path.dirname(__filename), '..', 'temp', vttFileName);
    fs.writeFileSync(vttPath, vttContent);

    res.json({
      success: true,
      data: {
        language: targetLanguage,
        subtitleUrl: `/subtitles/${vttFileName}`,
        subtitleCount: translatedSubtitles.length
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/video/languages
 * Get available translation languages
 */
router.get('/languages', (req, res) => {
  const languages = translationService.getAvailableLanguages();
  res.json({
    success: true,
    data: languages
  });
});

// Cleanup old files every hour
setInterval(() => {
  videoService.cleanupOldFiles();
}, 60 * 60 * 1000);

export default router;
