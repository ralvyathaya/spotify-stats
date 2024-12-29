import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Verify environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  NEXT_PUBLIC_SPOTIFY_REDIRECT_URI:
    process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
}

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
})

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
})

app.get("/", (req, res) => {
  res.json({ status: "Server is running" })
})

app.post("/login", async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" })
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code)

    // Set the access token on success
    const accessToken = data.body.access_token
    spotifyApi.setAccessToken(accessToken)

    // Return the tokens
    res.json({
      accessToken: accessToken,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    })
  } catch (error) {
    console.error("Authorization error:", {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
    })

    // Clear any existing tokens on error
    spotifyApi.resetAccessToken()
    spotifyApi.resetRefreshToken()

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
    res
      .status(error.statusCode || 400)
      .json({ error: "Failed to get recommendations" })
  }
})

const PORT = process.env.PORT || 3001

console.log("Starting server with config:", {
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "✓" : "✗",
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? "✓" : "✗",
  redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
  port: PORT,
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
