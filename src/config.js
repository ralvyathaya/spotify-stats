// API configuration
export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8888/.netlify/functions/api"
    : "/.netlify/functions/api"

// Spotify configuration
export const SPOTIFY_CONFIG = {
  scopes: [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
  ],
}
