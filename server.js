import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
})

app.post("/login", async (req, res) => {
  const { code } = req.body
  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    })
  } catch (err) {
    res.status(400).json({ error: "Failed to login" })
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
  } catch (err) {
    res.status(400).json({ error: "Failed to refresh token" })
  }
})

app.get("/recommendations", async (req, res) => {
  const { mood } = req.query
  let params = {}

  switch (mood) {
    case "happy":
      params = { min_valence: 0.7, min_energy: 0.7 }
      break
    case "sad":
      params = { max_valence: 0.3, max_energy: 0.3 }
      break
    case "energetic":
      params = { min_energy: 0.8, min_danceability: 0.7 }
      break
    default:
      params = {}
  }

  try {
    const data = await spotifyApi.getRecommendations(params)
    res.json(data.body.tracks)
  } catch (err) {
    res.status(400).json({ error: "Failed to get recommendations" })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
