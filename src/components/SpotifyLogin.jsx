// SpotifyLogin.jsx
import React, { useEffect } from 'react';

function SpotifyLogin({ onLogin }) {
  useEffect(() => {
    // Check if we're being redirected from Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const error = urlParams.get('error');

    if (error) {
      console.error('Error from Spotify:', error);
      return;
    }

    if (token) {
      onLogin(token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onLogin]);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No login URL received');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button 
        onClick={handleLogin}
        className="bg-retro-purple hover:bg-retro-purple/80 text-white font-retro py-4 px-8 rounded-lg 
        shadow-lg hover:shadow-xl transition-all duration-300 neon-glow transform hover:scale-105"
      >
        Login with Spotify
      </button>
      <p className="text-retro-cyan text-sm font-retro">Connect your Spotify account to get started</p>
    </div>
  );
}

export default SpotifyLogin;
