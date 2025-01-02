import React, { useState, useEffect } from 'react';
import { FaSpotify, FaPlay, FaPause } from 'react-icons/fa';

function NowPlaying({ accessToken }) {
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let interval;
    
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch current track');
        
        const data = await response.json();
        if (data) {
          setTrack(data);
          setProgress(data.progress_ms);
        } else {
          setTrack(null);
        }
      } catch (err) {
        console.error('Error fetching now playing:', err);
        setError(err.message);
      }
    };

    // Fetch immediately
    fetchNowPlaying();

    // Then fetch every 5 seconds
    interval = setInterval(fetchNowPlaying, 5000);

    return () => clearInterval(interval);
  }, [accessToken]);

  // Update progress bar
  useEffect(() => {
    let progressInterval;
    
    if (track?.is_playing) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= track.duration_ms) return 0;
          return prev + 1000;
        });
      }, 1000);
    }

    return () => clearInterval(progressInterval);
  }, [track]);

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading current track: {error}
      </div>
    );
  }

  if (!track) {
    return (
      <div className="card flex items-center justify-center py-8 text-gray-500">
        <FaSpotify className="w-6 h-6 mr-3" />
        <span>No track currently playing</span>
      </div>
    );
  }

  const progressPercent = (progress / track.duration_ms) * 100;

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        {track.image && (
          <img
            src={track.image}
            alt={`${track.album} cover`}
            className="w-16 h-16 rounded-lg shadow-md"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {track.name}
          </h3>
          <p className="text-gray-600 text-sm truncate">
            {track.artist} • {track.album}
          </p>
          
          <div className="mt-2">
            <div className="track-progress">
              <div 
                className="track-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(track.duration_ms)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {track.is_playing ? (
            <FaPlay className="w-4 h-4 text-primary-600" />
          ) : (
            <FaPause className="w-4 h-4 text-gray-400" />
          )}
          <a
            href={track.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700"
          >
            <FaSpotify className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default NowPlaying; 