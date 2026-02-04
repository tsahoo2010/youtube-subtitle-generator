import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for handling YouTube video operations using yt-dlp
 */
class VideoService {
  constructor() {
    this.tempDir = path.join(__dirname, '..', 'temp');
    this.ytDlpPath = 'yt-dlp'; // Will use PATH
    this.pythonPath = 'C:\\Users\\tanma\\AppData\\Local\\Programs\\Python\\Python312';
    this.pythonScriptsPath = 'C:\\Users\\tanma\\AppData\\Local\\Programs\\Python\\Python312\\Scripts';
    this.ffmpegPath = 'C:\\Users\\tanma\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin';
  }

  /**
   * Get video information from YouTube using yt-dlp
   */
  async getVideoInfo(videoUrl) {
    try {
      console.log('📹 Getting video information...');
      
      const ytDlpExe = path.join(this.pythonScriptsPath, 'yt-dlp.exe');
      const command = `"${ytDlpExe}" --dump-json --no-warnings "${videoUrl}"`;
      
      const { stdout, stderr } = await execPromise(command, {
        env: {
          ...process.env,
          PATH: `${this.pythonPath};${this.pythonScriptsPath};${this.ffmpegPath};${process.env.PATH}`
        },
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('yt-dlp stderr:', stderr);
      }

      const info = JSON.parse(stdout);
      
      return {
        videoId: info.id,
        title: info.title,
        duration: parseInt(info.duration || 0),
        thumbnail: info.thumbnail || (info.thumbnails && info.thumbnails[info.thumbnails.length - 1]?.url),
        author: info.uploader || info.channel,
        description: info.description || '',
        isPrivate: info.availability === 'private',
        isLiveContent: info.is_live || false
      };
    } catch (error) {
      console.error('❌ Failed to get video info:', error.message);
      throw new Error(`Failed to get video info: ${error.message}`);
    }
  }

  /**
   * Download audio from YouTube video using yt-dlp
   */
  async downloadAudio(videoUrl) {
    return new Promise((resolve, reject) => {
      try {
        const audioId = uuidv4();
        const audioPath = path.join(this.tempDir, `${audioId}.mp3`);

        console.log('🎵 Downloading audio from YouTube with yt-dlp...');

        const ytDlpExe = path.join(this.pythonScriptsPath, 'yt-dlp.exe');
        const ffmpegLocation = this.ffmpegPath;

        // yt-dlp command to download best audio and convert to mp3
        const ytDlp = spawn(ytDlpExe, [
          '-f', 'bestaudio',
          '-x', // Extract audio
          '--audio-format', 'mp3',
          '--audio-quality', '0', // Best quality
          '--ffmpeg-location', ffmpegLocation,
          '-o', audioPath.replace('.mp3', '.%(ext)s'), // Output template
          '--no-warnings',
          '--no-playlist',
          videoUrl
        ], {
          env: {
            ...process.env,
            PATH: `${this.pythonPath};${this.pythonScriptsPath};${this.ffmpegPath};${process.env.PATH}`
          }
        });

        let errorOutput = '';

        ytDlp.stdout.on('data', (data) => {
          console.log(`yt-dlp: ${data.toString().trim()}`);
        });

        ytDlp.stderr.on('data', (data) => {
          const message = data.toString();
          if (!message.includes('WARNING')) {
            errorOutput += message;
          }
          console.log(`yt-dlp: ${message.trim()}`);
        });

        ytDlp.on('close', (code) => {
          if (code === 0) {
            // Check if file exists (yt-dlp might have added extension)
            if (fs.existsSync(audioPath)) {
              console.log('✅ Audio download completed');
              resolve({ audioId, audioPath });
            } else {
              // Check for the file with potential different extension
              const dir = path.dirname(audioPath);
              const baseNameWithoutExt = path.basename(audioPath, '.mp3');
              const files = fs.readdirSync(dir).filter(f => f.startsWith(baseNameWithoutExt));
              
              if (files.length > 0) {
                const actualPath = path.join(dir, files[0]);
                // Rename to expected path
                fs.renameSync(actualPath, audioPath);
                console.log('✅ Audio download completed');
                resolve({ audioId, audioPath });
              } else {
                reject(new Error('Audio file not found after download'));
              }
            }
          } else {
            reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput}`));
          }
        });

        ytDlp.on('error', (error) => {
          console.error('❌ yt-dlp process error:', error);
          reject(new Error(`yt-dlp error: ${error.message}`));
        });

      } catch (error) {
        reject(new Error(`Failed to download audio: ${error.message}`));
      }
    });
  }

  /**
   * Download full video from YouTube using yt-dlp
   */
  async downloadVideo(videoUrl) {
    return new Promise((resolve, reject) => {
      try {
        const videoId = uuidv4();
        const videoPath = path.join(this.tempDir, `${videoId}.mp4`);

        console.log('🎬 Downloading video from YouTube with yt-dlp...');

        const ytDlpExe = path.join(this.pythonScriptsPath, 'yt-dlp.exe');
        const ffmpegLocation = this.ffmpegPath;

        // yt-dlp command to download video with audio in mp4 format
        const ytDlp = spawn(ytDlpExe, [
          '-f', 'best[ext=mp4]/best', // Best quality mp4 or best available
          '--merge-output-format', 'mp4',
          '--ffmpeg-location', ffmpegLocation,
          '-o', videoPath,
          '--no-warnings',
          '--no-playlist',
          videoUrl
        ], {
          env: {
            ...process.env,
            PATH: `${this.pythonPath};${this.pythonScriptsPath};${this.ffmpegPath};${process.env.PATH}`
          }
        });

        let errorOutput = '';

        ytDlp.stdout.on('data', (data) => {
          console.log(`yt-dlp: ${data.toString().trim()}`);
        });

        ytDlp.stderr.on('data', (data) => {
          const message = data.toString();
          if (!message.includes('WARNING')) {
            errorOutput += message;
          }
          console.log(`yt-dlp: ${message.trim()}`);
        });

        ytDlp.on('close', (code) => {
          if (code === 0) {
            if (fs.existsSync(videoPath)) {
              console.log('✅ Video download completed');
              resolve({ videoId, videoPath });
            } else {
              reject(new Error('Video file not found after download'));
            }
          } else {
            reject(new Error(`yt-dlp exited with code ${code}: ${errorOutput}`));
          }
        });

        ytDlp.on('error', (error) => {
          console.error('❌ yt-dlp process error:', error);
          reject(new Error(`yt-dlp error: ${error.message}`));
        });

      } catch (error) {
        reject(new Error(`Failed to download video: ${error.message}`));
      }
    });
  }

  /**
   * Legacy method - kept for compatibility
   */
  async extractAudioWithFFmpeg(videoUrl) {
    // Just redirect to downloadAudio since yt-dlp handles conversion internally
    return this.downloadAudio(videoUrl);
  }

  /**
   * Clean up temporary files
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup file: ${error.message}`);
    }
  }

  /**
   * Clean up old temporary files (older than 1 hour)
   */
  cleanupOldFiles() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1 hour

      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up old file: ${file}`);
        }
      });
    } catch (error) {
      console.error(`Failed to cleanup old files: ${error.message}`);
    }
  }
}

export default new VideoService();
