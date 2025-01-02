import React, { useState, useEffect } from 'react';
import { FaSpotify, FaPlay } from 'react-icons/fa';
import { IoTrendingUp } from 'react-icons/io5';

function TopTracks({ accessToken, timeRange }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/top-tracks?time_range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch top tracks');
        
        const data = await response.json();
        setTracks(data);
      } catch (err) {
        console.error('Error fetching top tracks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [accessToken, timeRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading top tracks: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary-600">
        <IoTrendingUp className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Your Top Tracks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="card group">
            <div className="flex items-center gap-4">
              {track.image ? (
                <img
                  src={track.image}
                  alt={`${track.album} cover`}
                  className="w-16 h-16 rounded-lg shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaMusic className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary-600 transition-colors">
                  {index + 1}. {track.name}
                </h3>
                <p className="text-gray-600 text-sm truncate">
                  {track.artist}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {track.popularity}% popular
                  </div>
                </div>
              </div>

              <a
                href={track.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <FaSpotify className="w-5 h-5" />
              </a>
            </div>

            {track.preview_url && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <audio
                  controls
                  className="w-full h-8"
                >
                  <source src={track.preview_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopTracks; 