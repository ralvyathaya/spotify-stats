// SpotifyLogin.jsx
import React, { useEffect } from 'react';

function SpotifyLogin({ onLogin }) {
  useEffect(() => {
    // Check if we're being redirected from Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Error from Spotify:', error);
      return;
    }

    if (code) {
      // Exchange code for token
      exchangeCodeForToken(code);
    }
  }, []);

  const exchangeCodeForToken = async (code) => {
    try {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      onLogin(data.access_token);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  };

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
