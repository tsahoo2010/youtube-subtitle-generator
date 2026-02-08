import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import LocalVideoPlayer from './components/LocalVideoPlayer';
import URLInput from './components/URLInput';
import LanguageSelector from './components/LanguageSelector';
import VideoInfo from './components/VideoInfo';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { generateSubtitles, generateSubtitlesLocal, translateSubtitles } from './services/api';

function App() {
  const [videoId, setVideoId] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null); // For local playback
  const [useLocalPlayback, setUseLocalPlayback] = useState(true); // Default to local playback
  const [sourceLanguage, setSourceLanguage] = useState('english'); // Language of the video
  const [targetLanguage, setTargetLanguage] = useState('english'); // Language for subtitles
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [originalSubtitles, setOriginalSubtitles] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Handle subtitle generation
  const handleGenerateSubtitles = async (url) => {
    setLoading(true);
    setError('');
    setLoadingMessage('Fetching video information...');
    setCurrentUrl(url);

    try {
      if (useLocalPlayback) {
        setLoadingMessage('Downloading video for local playback (this may take a few minutes)...');
        const result = await generateSubtitlesLocal(url, targetLanguage, sourceLanguage);

        if (result.success) {
          setVideoId(result.data.videoId);
          setVideoInfo({
            title: result.data.title,
            videoId: result.data.videoId,
            author: 'YouTube',
            duration: 0,
            thumbnail: `https://img.youtube.com/vi/${result.data.videoId}/maxresdefault.jpg`
          });
          setSubtitleUrl(result.data.subtitleUrl);
          setVideoUrl(result.data.videoUrl);
          setOriginalSubtitles(result.data.subtitles);
        }
      } else {
        setLoadingMessage('Extracting audio from video...');
        await new Promise(resolve => setTimeout(resolve, 500));

        setLoadingMessage('Transcribing audio (this may take a few minutes)...');
        const result = await generateSubtitles(url, targetLanguage, sourceLanguage);

        if (result.success) {
          setVideoId(result.data.videoId);
          setVideoInfo({
            title: result.data.title,
            videoId: result.data.videoId,
            author: 'YouTube',
            duration: 0,
            thumbnail: `https://img.youtube.com/vi/${result.data.videoId}/maxresdefault.jpg`
          });
          setSubtitleUrl(result.data.subtitleUrl);
          setOriginalSubtitles(result.data.subtitles);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to generate subtitles. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Handle target language change
  const handleTargetLanguageChange = async (language) => {
    if (language === targetLanguage) return;

    setTargetLanguage(language);

    if (!currentUrl || !videoId) return;

    setLoading(true);
    setError('');
    setLoadingMessage(`Translating subtitles to ${language}...`);

    try {
      const result = await generateSubtitles(currentUrl, language, sourceLanguage);

      if (result.success) {
        setSubtitleUrl(result.data.subtitleUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to translate subtitles. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Handle source language change
  const handleSourceLanguageChange = (language) => {
    setSourceLanguage(language);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            YouTube Subtitle Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate and translate subtitles for any YouTube video using AI-powered speech recognition
          </p>
        </header>

        {/* Error Message */}
        <div className="max-w-4xl mx-auto mb-6">
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        </div>

        {/* URL Input */}
        {!videoId && (
          <div className="mb-8">
            <URLInput onSubmit={handleGenerateSubtitles} loading={loading} />
          </div>
        )}

        {/* Language Selector */}
        {!loading && !videoId && (
          <div className="max-w-3xl mx-auto mb-8">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              onSourceLanguageChange={handleSourceLanguageChange}
              onTargetLanguageChange={setTargetLanguage}
              disabled={loading}
            />
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        {/* Video Player Section */}
        {!loading && videoId && (
          <div className="max-w-6xl mx-auto">
            {/* Video Info */}
            <VideoInfo videoInfo={videoInfo} />

            {/* Language Selector */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <LanguageSelector
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                onSourceLanguageChange={handleSourceLanguageChange}
                onTargetLanguageChange={handleTargetLanguageChange}
                disabled={loading}
              />
            </div>

            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {useLocalPlayback && videoUrl ? (
                <LocalVideoPlayer
                  videoUrl={videoUrl}
                  subtitleUrl={subtitleUrl}
                  className="w-full"
                />
              ) : (
                <VideoPlayer
                  videoId={videoId}
                  subtitleUrl={subtitleUrl}
                  className="w-full aspect-video"
                />
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to use:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-blue-800">
                <li>Subtitles are automatically displayed on the video</li>
                <li>Select a different language to see translated subtitles</li>
                <li>Use the video player controls to adjust subtitle settings</li>
                <li>Click the CC button on the player to toggle subtitles on/off</li>
              </ul>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setVideoId(null);
                  setVideoInfo(null);
                  setSubtitleUrl(null);
                  setOriginalSubtitles(null);
                  setCurrentUrl('');
                  setSourceLanguage('english');
                  setTargetLanguage('english');
                  setError('');
                }}
                className="bg-gray-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Process Another Video
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Powered by AssemblyAI and LibreTranslate
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
