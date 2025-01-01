import React, { useState, useEffect } from 'react';
import SpotifyLogin from './components/SpotifyLogin';
import MoodSelector from './components/MoodSelector';
import SongList from './components/SongList';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [mood, setMood] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
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
    <div className="App">
      <h1>Spotify Mood Player</h1>
      {!accessToken ? (
        <SpotifyLogin onLogin={handleLogin} />
      ) : (
        <>
          <MoodSelector onMoodSelect={handleMoodSelect} />
          {mood && <SongList songs={songs} />}
        </>
      )}
    </div>
  );
}

export default App;

