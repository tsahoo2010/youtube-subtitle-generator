import React, { useEffect, useRef, useState } from 'react';

/**
 * LocalVideoPlayer component using HTML5 video with custom subtitle overlay
 */
const LocalVideoPlayer = ({ videoUrl, subtitleUrl, onReady, className = '' }) => {
  const videoRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Update current subtitle based on video time
  useEffect(() => {
    if (!videoRef.current || subtitles.length === 0) return;

    const updateSubtitle = () => {
      const currentTime = videoRef.current.currentTime;
      const subtitle = subtitles.find(
        sub => currentTime >= sub.start && currentTime <= sub.end
      );
      setCurrentSubtitle(subtitle ? subtitle.text : '');
    };

    const video = videoRef.current;
    video.addEventListener('timeupdate', updateSubtitle);

    return () => {
      video.removeEventListener('timeupdate', updateSubtitle);
    };
  }, [subtitles]);

  // Notify parent when video is ready
  useEffect(() => {
    if (videoRef.current && onReady) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        onReady();
      });
    }
  }, [onReady]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={`http://localhost:3001${videoUrl}`}
          controls
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support the video tag.
        </video>

        {/* Subtitle overlay */}
        {currentSubtitle && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4 pointer-events-none">
            <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg max-w-3xl text-center shadow-lg">
              <p className="text-lg font-medium leading-relaxed">
                {currentSubtitle}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle display below video */}
      <div className="mt-4 p-4 bg-gray-800 rounded-lg min-h-[60px] flex items-center justify-center">
        {currentSubtitle ? (
          <p className="text-white text-center text-lg">
            {currentSubtitle}
          </p>
        ) : (
          <p className="text-gray-400 text-center">
            {subtitles.length > 0 ? 'Subtitles will appear here...' : 'Loading subtitles...'}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocalVideoPlayer;
