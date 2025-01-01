import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
})

// Basic moods that don't require genre validation
const MOODS = [
  { id: "happy", name: "Happy" },
  { id: "sad", name: "Sad" },
  { id: "energetic", name: "Energetic" },
  { id: "relaxed", name: "Relaxed" },
  { id: "focused", name: "Focused" },
  { id: "romantic", name: "Romantic" },
]

app.get("/available-moods", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1]
    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" })
    }

    // Just return the predefined moods
    res.json(MOODS)
  } catch (error) {
    console.error("Error in /available-moods:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/recommendations", async (req, res) => {
  try {
    const { mood } = req.query
    const accessToken = req.headers.authorization?.split(" ")[1]

    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" })
    }

    if (!mood) {
      return res.status(400).json({ error: "Mood parameter is required" })
    }

    spotifyApi.setAccessToken(accessToken)

    const moodParams = {
      happy: {
        seed_genres: ["pop", "dance"],
        target_valence: 0.8,
        target_energy: 0.8,
        min_valence: 0.7,
      },
      sad: {
        seed_genres: ["acoustic", "ambient"],
        target_valence: 0.2,
        target_energy: 0.3,
        max_valence: 0.3,
      },
      energetic: {
        seed_genres: ["edm", "dance"],
        target_energy: 0.9,
        target_danceability: 0.8,
        min_energy: 0.8,
      },
      relaxed: {
        seed_genres: ["chill", "ambient"],
        target_energy: 0.3,
        target_valence: 0.5,
        max_energy: 0.4,
      },
      focused: {
        seed_genres: ["classical", "instrumental"],
        target_energy: 0.5,
        target_instrumentalness: 0.8,
      },
      romantic: {
        seed_genres: ["jazz", "soul"],
        target_valence: 0.6,
        target_energy: 0.4,
        target_acousticness: 0.5,
      },
    }

    if (!moodParams[mood]) {
      return res.status(400).json({ error: "Invalid mood" })
    }

    const params = {
      ...moodParams[mood],
      limit: 9,
    }

    const recommendations = await spotifyApi.getRecommendations(params)
    res.json(recommendations.body.tracks)
  } catch (error) {
    console.error("Error in /recommendations:", error)
    res.status(500).json({ error: "Failed to get recommendations" })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
