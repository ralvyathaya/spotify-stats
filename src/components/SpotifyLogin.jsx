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
    <button onClick={handleLogin}>Login with Spotify</button>
  );
}

export default SpotifyLogin;

