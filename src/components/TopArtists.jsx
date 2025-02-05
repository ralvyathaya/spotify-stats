import React, { useState, useEffect } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { IoMusicalNotes } from 'react-icons/io5';

function TopArtists({ accessToken, timeRange }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/top-artists?time_range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch top artists');
        
        const data = await response.json();
        setArtists(data);
      } catch (err) {
        console.error('Error fetching top artists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, [accessToken, timeRange]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card aspect-square">
            <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading top artists: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary-600">
        <IoMusicalNotes className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Your Top Artists</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist, index) => (
          <div key={artist.id} className="card group hover:scale-105 transition-transform duration-300">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaSpotify className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-sm font-medium">#{index + 1}</div>
              </div>
            </div>

            <h3 className="font-semibold truncate group-hover:text-primary-600 transition-colors">
              {artist.name}
            </h3>

            <div className="mt-2 flex flex-wrap gap-1">
              {artist.genres.slice(0, 2).map((genre, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {artist.popularity}% popular
              </div>
              <a
                href={artist.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <FaSpotify className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopArtists; 