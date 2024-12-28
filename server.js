import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body)
  next()
})

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
})

app.post("/login", async (req, res) => {
  const { code } = req.body

  if (!code) {
    console.error("No code provided")
    return res.status(400).json({ error: "Authorization code is required" })
  }

  console.log("Login attempt with:", {
    code: code.slice(0, 10) + "...", // Only log first 10 chars for security
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID?.slice(0, 5) + "...",
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
  })

  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    console.log("Spotify auth successful, received tokens")

    // Set the access token
    spotifyApi.setAccessToken(data.body.access_token)

    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    })
  } catch (error) {
    console.error("Spotify auth error:", {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
    })

    res.status(error.statusCode || 400).json({
      error: "Authorization failed",
      details: error.message,
      body: error.body,
    })
  }
})

app.get("/recommendations", async (req, res) => {
  const { mood } = req.query
  const accessToken = req.headers.authorization?.split(" ")[1]

  if (!accessToken) {
    return res.status(401).json({ error: "No access token provided" })
  }

  spotifyApi.setAccessToken(accessToken)
  let params = {}

  switch (mood) {
    case "happy":
      params = { min_valence: 0.7, min_energy: 0.7, limit: 9 }
      break
    case "sad":
      params = { max_valence: 0.3, max_energy: 0.3, limit: 9 }
      break
    case "energetic":
      params = { min_energy: 0.8, min_danceability: 0.7, limit: 9 }
      break
    default:
      return res.status(400).json({ error: "Invalid mood" })
  }

  try {
    const data = await spotifyApi.getRecommendations(params)
    res.json(data.body.tracks)
  } catch (error) {
    console.error("Recommendations error:", error)
    res.status(error.statusCode || 400).json({
      error: "Failed to get recommendations",
      details: error.message,
    })
  }
})

const PORT = process.env.PORT || 3001

// Verify environment variables before starting
console.log("Environment check:", {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "✓" : "✗",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? "✓" : "✗",
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
