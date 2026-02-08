import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get video information
 */
export const getVideoInfo = async (url) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/video/info`, { url });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get video info');
  }
};

/**
 * Generate subtitles for a video
 */
export const generateSubtitles = async (url, targetLanguage = 'english', sourceLanguage = 'english') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/video/generate-subtitles`, {
      url,
      language: targetLanguage,
      sourceLanguage
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate subtitles');
  }
};

/**
 * Generate subtitles and download video for local playback
 */
export const generateSubtitlesLocal = async (url, targetLanguage = 'english', sourceLanguage = 'english') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/video/generate-subtitles-local`, {
      url,
      language: targetLanguage,
      sourceLanguage
    }, {
      timeout: 600000 // 10 minutes timeout for video download
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to generate subtitles with local playback');
  }
};

/**
 * Translate existing subtitles
 */
export const translateSubtitles = async (subtitles, targetLanguage, sourceLanguage = 'english') => {
  try {
    const response = await axios.post(`${API_BASE_URL}/video/translate-subtitles`, {
      subtitles,
      targetLanguage,
      sourceLanguage
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to translate subtitles');
  }
};

/**
 * Get available languages
 */
export const getAvailableLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/video/languages`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to get available languages');
  }
};

export default {
  getVideoInfo,
  generateSubtitles,
  translateSubtitles,
  getAvailableLanguages
};
