import React, { useState, useEffect } from 'react';
import { FaSpotify, FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

function NowPlaying({ accessToken }) {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up polling for currently playing track
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/now-playing`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 204) {
            // No content - no track currently playing
            setTrack(null);
          } else {
            throw new Error('Failed to fetch now playing');
          }
        } else {
          const data = await response.json();
          setTrack(data);
        }
      } catch (err) {
        console.error('Error fetching now playing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlaying();
    
    // Poll every 30 seconds
    const intervalId = setInterval(fetchNowPlaying, 30000);
    
    return () => clearInterval(intervalId);
  }, [accessToken]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-900 text-red-200">
        <p>Error loading currently playing track: {error}</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <FaVolumeUp className="w-5 h-5 text-gray-400" />
          <p className="text-gray-400">Not currently playing anything</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex gap-4">
        {track.image ? (
          <img
            src={track.image}
            alt={`${track.album} cover`}
            className="w-16 h-16 rounded-lg shadow-md"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
            <FaSpotify className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-semibold truncate">
              {track.name}
            </h3>
            <span className="ml-2 text-xs px-2 py-0.5 bg-primary-900 text-primary-300 rounded-full">
              Now Playing
            </span>
          </div>

          <p className="text-gray-400 text-sm">
            {track.artist}
          </p>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{formatTime(track.progress_ms)}</span>
              <span>{formatTime(track.duration_ms)}</span>
            </div>
            <div className="track-progress">
              <div
                className="track-progress-bar"
                style={{ width: `${(track.progress_ms / track.duration_ms) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {track.is_playing ? (
            <FaPlay className="w-4 h-4 text-primary-400" />
          ) : (
            <FaPause className="w-4 h-4 text-gray-400" />
          )}
          <a
            href={track.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300"
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