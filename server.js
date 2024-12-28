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

// Basic route to test server
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

app.post("/login", async (req, res) => {
  const { code } = req.body
  console.log("Received code:", code)
  console.log("Using credentials:", {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
  })

  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    console.log("Spotify API response:", data.body)
    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    })
  } catch (error) {
    console.error("Detailed login error:", {
      message: error.message,
      body: error.body,
      statusCode: error.statusCode,
    })
    res.status(400).json({
      error: "Failed to login",
      details: error.message,
      body: error.body,
    })
  }
})

app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body
  spotifyApi.setRefreshToken(refreshToken)
  try {
    const data = await spotifyApi.refreshAccessToken()
    res.json({
      accessToken: data.body.access_token,
      expiresIn: data.body.expires_in,
    })
  } catch (error) {
    console.error("Refresh error:", error)
    res.status(400).json({ error: "Failed to refresh token" })
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
    res.status(400).json({ error: "Failed to get recommendations" })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log("Environment variables loaded:", {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "Set" : "Not set",
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? "Set" : "Not set",
    redirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
  })
})
