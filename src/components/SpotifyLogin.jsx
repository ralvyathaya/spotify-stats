// SpotifyLogin.jsx
import React from 'react';

function SpotifyLogin({ onLogin }) {
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/login');
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="bg-retro-purple hover:bg-retro-purple/80 text-white font-press-start py-4 px-8 rounded-lg 
      shadow-lg hover:shadow-xl transition-all duration-300 neon-glow transform hover:scale-105"
    >
      Login with Spotify
    </button>
  );
}

export default SpotifyLogin;
