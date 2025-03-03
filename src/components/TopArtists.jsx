import React, { useState, useEffect } from 'react';
import { FaSpotify, FaHotjar, FaCrown, FaUserSecret } from 'react-icons/fa';
import { IoMusicalNotes } from 'react-icons/io5';
import { BsEmojiLaughingFill } from 'react-icons/bs';

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
        
        // Add fun metrics to artists
        const enhancedArtists = data.map(artist => ({
          ...artist,
          // Generate random fun metrics for demonstration
          trendinessScore: Math.floor(Math.random() * 100),
          undergroundScore: Math.floor(Math.random() * 100),
          memeCultureImpact: Math.floor(Math.random() * 100),
          isRoyalty: Math.random() > 0.85, // Top-tier artists
        }));
        
        setArtists(enhancedArtists);
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
            <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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

  // Helper function to determine badge color based on score
  const getBadgeColor = (score, type) => {
    if (type === 'underground') {
      return score > 70 ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300';
    } else if (type === 'meme') {
      return score > 70 ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300';
    } else { // trending
      return score > 70 ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary-400">
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
                <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <FaSpotify className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-sm font-medium">#{index + 1}</div>
                {artist.isRoyalty && (
                  <div className="absolute top-2 right-2 text-amber-300">
                    <FaCrown className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>

            <h3 className="font-semibold truncate group-hover:text-primary-400 transition-colors">
              {artist.name}
            </h3>

            <div className="mt-2 flex flex-wrap gap-1">
              {artist.genres.slice(0, 2).map((genre, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {artist.popularity}% popular
                </div>
                <a
                  href={artist.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <FaSpotify className="w-5 h-5" />
                </a>
              </div>
              
              {/* Artist metrics */}
              <div className="grid grid-cols-1 gap-2 mt-2 pt-2 border-t border-gray-700">
                <div className={`flex items-center justify-between text-xs px-2 py-1 rounded-full ${getBadgeColor(artist.trendinessScore, 'trending')}`}>
                  <div className="flex items-center gap-1">
                    <FaHotjar className="w-3 h-3" />
                    <span>Trending Score</span>
                  </div>
                  <span>{artist.trendinessScore}%</span>
                </div>
                
                <div className={`flex items-center justify-between text-xs px-2 py-1 rounded-full ${getBadgeColor(artist.undergroundScore, 'underground')}`}>
                  <div className="flex items-center gap-1">
                    <FaUserSecret className="w-3 h-3" />
                    <span>Underground</span>
                  </div>
                  <span>{artist.undergroundScore}%</span>
                </div>
                
                <div className={`flex items-center justify-between text-xs px-2 py-1 rounded-full ${getBadgeColor(artist.memeCultureImpact, 'meme')}`}>
                  <div className="flex items-center gap-1">
                    <BsEmojiLaughingFill className="w-3 h-3" />
                    <span>Meme Impact</span>
                  </div>
                  <span>{artist.memeCultureImpact}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopArtists; 