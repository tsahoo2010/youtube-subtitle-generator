import React, { useEffect, useRef, useState } from 'react';

/**
 * VideoPlayer component using YouTube iframe with custom subtitle overlay
 */
const VideoPlayer = ({ videoId, subtitleUrl, onReady, className = '' }) => {
  const iframeRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const playerRef = useRef(null);
  const [embedError, setEmbedError] = useState(false);

  // Load subtitles from VTT file
  useEffect(() => {
    if (!subtitleUrl) return;

    const loadSubtitles = async () => {
      try {
        const response = await fetch(`http://localhost:3001${subtitleUrl}`);
        const vttText = await response.text();
        
        // Parse VTT format
        const lines = vttText.split('\n');
        const parsedSubtitles = [];
        let i = 0;
        
        while (i < lines.length) {
          const line = lines[i].trim();
          
          // Look for timestamp line
          if (line.includes('-->')) {
            const [startTime, endTime] = line.split('-->').map(t => t.trim());
            const text = [];
            i++;
            
            // Collect subtitle text until empty line
            while (i < lines.length && lines[i].trim() !== '') {
              text.push(lines[i].trim());
              i++;
            }
            
            parsedSubtitles.push({
              start: parseVttTime(startTime),
              end: parseVttTime(endTime),
              text: text.join(' ')
            });
          }
          i++;
        }
        
        setSubtitles(parsedSubtitles);
        console.log('Loaded subtitles:', parsedSubtitles.length);
      } catch (error) {
        console.error('Failed to load subtitles:', error);
      }
    };

    loadSubtitles();
  }, [subtitleUrl]);

  // Parse VTT timestamp to seconds
  const parseVttTime = (timeString) => {
    const parts = timeString.split(':');
    const seconds = parseFloat(parts[parts.length - 1].replace(',', '.'));
    const minutes = parseInt(parts[parts.length - 2] || 0);
    const hours = parseInt(parts[parts.length - 3] || 0);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Initialize YouTube iframe API
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube iframe API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Setup player when API is ready
    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onReady: (event) => {
            console.log('YouTube player ready');
            setEmbedError(false);
            if (onReady) onReady(event.target);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startSubtitleSync();
            }
          },
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            if (event.data === 101 || event.data === 150) {
              setEmbedError(true);
            }
          }
        }
      });
    };

    // Wait for API to be ready
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Sync subtitles with video playback
  const startSubtitleSync = () => {
    if (!playerRef.current || subtitles.length === 0) return;

    // Clear any existing interval
    if (window.subtitleInterval) {
      clearInterval(window.subtitleInterval);
    }

    window.subtitleInterval = setInterval(() => {
      if (!playerRef.current || !playerRef.current.getCurrentTime) {
        clearInterval(window.subtitleInterval);
        return;
      }

      try {
        const currentTime = playerRef.current.getCurrentTime();
        const currentSub = subtitles.find(
          sub => currentTime >= sub.start && currentTime <= sub.end
        );
        
        setCurrentSubtitle(currentSub ? currentSub.text : '');
      } catch (error) {
        console.error('Error syncing subtitles:', error);
      }
    }, 100);
  };

  return (
    <div className={`relative ${className}`}>
      {embedError ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">Video Embedding Restricted</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This video's owner has restricted embedding. You can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <a 
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline hover:text-yellow-900"
                    >
                      Watch on YouTube
                    </a>
                  </li>
                  {subtitleUrl && (
                    <li>
                      <a 
                        href={`http://localhost:3001${subtitleUrl}`}
                        download
                        className="font-semibold underline hover:text-yellow-900"
                      >
                        Download subtitles (VTT file)
                      </a>
                    </li>
                  )}
                </ul>
                {subtitles.length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded border border-yellow-200">
                    <p className="font-semibold mb-2">Transcription:</p>
                    <p className="text-gray-700">{subtitles.map(s => s.text).join(' ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <div
              ref={iframeRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
          
          {/* Subtitle overlay */}
          {currentSubtitle && (
            <div
              className="absolute bottom-16 left-0 right-0 text-center pointer-events-none"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.8)',
                zIndex: 10
              }}
            >
              <span className="inline-block bg-black bg-opacity-70 text-white px-4 py-2 rounded text-lg font-semibold">
                {currentSubtitle}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
