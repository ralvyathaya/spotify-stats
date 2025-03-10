import React from "react";
import { FaSpotify } from "react-icons/fa";
import { API_BASE_URL } from "../config";

function SpotifyLogin() {
  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Error response from login:", text);
        throw new Error(`Failed to fetch login URL: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No login URL received in response:", data);
        throw new Error("No login URL provided by the server");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
        <button
          onClick={handleLogin}
          className="relative flex items-center gap-3 px-8 py-4 bg-white rounded-lg leading-none"
        >
          <FaSpotify className="w-6 h-6 text-[#1DB954]" />
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
            Connect with Spotify
          </span>
        </button>
      </div>
      <p className="text-gray-600 text-sm max-w-sm text-center">
        Connect your Spotify account to see your top tracks, artists, and listening habits
      </p>
    </div>
  );
}

export default SpotifyLogin;