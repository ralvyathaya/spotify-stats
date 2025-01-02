// App.jsx
import React, { useState, useEffect } from 'react';
import SpotifyLogin from './components/SpotifyLogin';
import MoodSelector from './components/MoodSelector';
import SongList from './components/SongList';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [mood, setMood] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Check URL parameters for tokens
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    
    if (token) {
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
    localStorage.setItem('spotify_access_token', token);
  };

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    try {
      const response = await fetch(`http://localhost:3001/recommendations?mood=${selectedMood}`);
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-press-start text-center mb-12 text-retro-purple neon-glow">
          Mood Tunes
        </h1>
        <div className="flex flex-col items-center">
          {!accessToken ? (
            <SpotifyLogin onLogin={handleLogin} />
          ) : (
            <>
              <MoodSelector onMoodSelect={handleMoodSelect} />
              {mood && <SongList songs={songs} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;