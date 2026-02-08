import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Service for transcribing audio using AssemblyAI
 */
class TranscriptionService {
  constructor() {
    this.baseUrl = 'https://api.assemblyai.com/v2';
    
    // Check API key on first access, not at construction time
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.warn('⚠️ AssemblyAI API key not found. Transcription will not work.');
    }
  }

  /**
   * Language codes mapping for AssemblyAI
   */
  getLanguageCode(language) {
    const codes = {
      'english': 'en',
      'spanish': 'es',
      'hindi': 'hi',
      'chinese': 'zh'
    };
    return codes[language.toLowerCase()] || 'en';
  }

  /**
   * Get API key with runtime check
   */
  getApiKey() {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error('AssemblyAI API key is not configured');
    }
    return apiKey;
  }

  /**
   * Upload audio file to AssemblyAI
   */
  async uploadAudio(audioFilePath) {
    try {
      const audioData = fs.readFileSync(audioFilePath);
      
      const response = await axios.post(
        `${this.baseUrl}/upload`,
        audioData,
        {
          headers: {
            'authorization': this.getApiKey(),
            'content-type': 'application/octet-stream'
          }
        }
      );

      return response.data.upload_url;
    } catch (error) {
      throw new Error(`Audio upload failed: ${error.message}`);
    }
  }

  /**
   * Request transcription from AssemblyAI
   */
  async requestTranscription(audioUrl, sourceLanguage = 'english') {
    try {
      const languageCode = this.getLanguageCode(sourceLanguage);
      
      const requestBody = {
        audio_url: audioUrl
      };

      // If language is specified and not English, set it explicitly
      // Otherwise use language detection
      if (languageCode !== 'en') {
        requestBody.language_code = languageCode;
      } else {
        requestBody.language_detection = true;
      }

      const response = await axios.post(
        `${this.baseUrl}/transcript`,
        requestBody,
        {
          headers: {
            'authorization': this.getApiKey(),
            'content-type': 'application/json'
          }
        }
      );

      return response.data.id;
    } catch (error) {
      throw new Error(`Transcription request failed: ${error.message}`);
    }
  }

  /**
   * Poll for transcription completion
   */
  async getTranscription(transcriptId) {
    try {
      while (true) {
        const response = await axios.get(
          `${this.baseUrl}/transcript/${transcriptId}`,
          {
            headers: {
              'authorization': this.getApiKey()
            }
          }
        );

        const { status, text, words, error } = response.data;

        if (status === 'completed') {
          return { text, words };
        } else if (status === 'error') {
          throw new Error(`Transcription failed: ${error}`);
        }

        // Wait 3 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      throw new Error(`Failed to get transcription: ${error.message}`);
    }
  }

  /**
   * Generate subtitles with timestamps from transcription
   */
  generateSubtitles(words) {
    if (!words || words.length === 0) {
      return [];
    }

    const subtitles = [];
    const maxWordsPerSubtitle = 10;
    const maxDuration = 5000; // 5 seconds max per subtitle

    let currentSubtitle = {
      start: words[0].start,
      end: words[0].end,
      text: words[0].text
    };
    let wordCount = 1;

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const duration = word.end - currentSubtitle.start;

      if (wordCount >= maxWordsPerSubtitle || duration >= maxDuration) {
        subtitles.push({ ...currentSubtitle });
        currentSubtitle = {
          start: word.start,
          end: word.end,
          text: word.text
        };
        wordCount = 1;
      } else {
        currentSubtitle.end = word.end;
        currentSubtitle.text += ' ' + word.text;
        wordCount++;
      }
    }

    // Add the last subtitle
    if (currentSubtitle.text) {
      subtitles.push(currentSubtitle);
    }

    return subtitles;
  }

  /**
   * Complete transcription pipeline
   */
  async transcribeAudio(audioFilePath, sourceLanguage = 'english') {
    const apiKey = this.getApiKey(); // Will throw if not configured

    console.log(`📤 Uploading audio to AssemblyAI...`);
    const audioUrl = await this.uploadAudio(audioFilePath);

    console.log(`🎙️ Requesting transcription for ${sourceLanguage} audio...`);
    const transcriptId = await this.requestTranscription(audioUrl, sourceLanguage);

    console.log('⏳ Waiting for transcription to complete...');
    const { text, words } = await this.getTranscription(transcriptId);

    console.log('✅ Transcription completed');
    return {
      fullText: text,
      subtitles: this.generateSubtitles(words)
    };
  }
}

export default new TranscriptionService();
