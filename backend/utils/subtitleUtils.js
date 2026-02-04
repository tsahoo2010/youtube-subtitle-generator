/**
 * Convert subtitles array to WebVTT format
 */
export function toWebVTT(subtitles) {
  let vtt = 'WEBVTT\n\n';

  subtitles.forEach((subtitle, index) => {
    const startTime = formatTimestamp(subtitle.start);
    const endTime = formatTimestamp(subtitle.end);

    vtt += `${index + 1}\n`;
    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${subtitle.text}\n\n`;
  });

  return vtt;
}

/**
 * Convert subtitles array to SRT format
 */
export function toSRT(subtitles) {
  let srt = '';

  subtitles.forEach((subtitle, index) => {
    const startTime = formatTimestampSRT(subtitle.start);
    const endTime = formatTimestampSRT(subtitle.end);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${subtitle.text}\n\n`;
  });

  return srt;
}

/**
 * Format timestamp for WebVTT (HH:MM:SS.mmm)
 */
function formatTimestamp(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
}

/**
 * Format timestamp for SRT (HH:MM:SS,mmm)
 */
function formatTimestampSRT(milliseconds) {
  return formatTimestamp(milliseconds).replace('.', ',');
}

/**
 * Pad number with zeros
 */
function pad(num, size) {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

/**
 * Parse YouTube video ID from URL
 */
export function parseVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url) {
  return parseVideoId(url) !== null;
}
