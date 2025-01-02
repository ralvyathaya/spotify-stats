// App.jsx
import React, { useState, useEffect } from 'react';
import SpotifyLogin from './components/SpotifyLogin';
import MoodSelector from './components/MoodSelector';
import SongList from './components/SongList';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [mood, setMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check URL parameters for tokens or errors
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const error = urlParams.get('error');
    
    if (error) {
      setError('Failed to authenticate with Spotify');
      localStorage.removeItem('spotify_access_token');
    } else if (token) {
      handleLogin(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  const handleLogin = (token) => {
    setAccessToken(token);
    setError(null);
    localStorage.setItem('spotify_access_token', token);
  };

  const handleLogout = () => {
    setAccessToken(null);
    setMood(null);
    setSongs([]);
    localStorage.removeItem('spotify_access_token');
  };

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    try {
      const response = await fetch(`/api/recommendations?mood=${selectedMood}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch song recommendations');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-retro-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-retro text-center mb-12 text-retro-purple neon-glow">
          Mood Tunes
        </h1>
        
        {error && (
          <div className="text-red-500 text-center mb-4 font-retro text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-8">
          {!accessToken ? (
            <SpotifyLogin onLogin={handleLogin} />
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="text-retro-pink hover:text-retro-pink/80 font-retro text-sm underline"
              >
                Logout
              </button>
              <MoodSelector onMoodSelect={handleMoodSelect} />
              {mood && <SongList songs={songs} />}
            </>
          )}
        </div>

        <footer className="mt-16 text-center text-retro-cyan/60 text-xs font-retro">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;