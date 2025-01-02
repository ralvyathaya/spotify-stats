import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()

// Configure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
)

app.use(express.json())

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
})

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Mood Tunes API is running" })
})

app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "streaming",
    "user-library-read",
    "user-read-playback-state",
  ]
  const state = Math.random().toString(36).substring(7)
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)
  res.json({ url: authorizeURL })
})

app.get("/callback", async (req, res) => {
  const { code, error } = req.query

  if (error) {
    console.error("Spotify Auth Error:", error)
    return res.redirect(`${process.env.CLIENT_URL}?error=spotify_auth_error`)
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body

    // Store tokens in the API instance
    spotifyApi.setAccessToken(access_token)
    spotifyApi.setRefreshToken(refresh_token)

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.CLIENT_URL}?access_token=${access_token}&refresh_token=${refresh_token}`
    )
  } catch (error) {
    console.error("Auth Error:", error)
    res.redirect(`${process.env.CLIENT_URL}?error=authentication_failed`)
  }
})

app.get("/recommendations", async (req, res) => {
  const { mood } = req.query
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization token provided" })
  }

  const token = authHeader.split(" ")[1]
  spotifyApi.setAccessToken(token)

  try {
    const recommendations = await getRecommendations(mood)
    res.json(recommendations)
  } catch (error) {
    console.error("Recommendations Error:", error)
    if (error.statusCode === 401) {
      return res.status(401).json({ error: "Token expired" })
    }
    res
      .status(error.statusCode || 400)
      .json({ error: "Error fetching recommendations" })
  }
})

async function getRecommendations(mood) {
  const moodToFeatures = {
    happy: {
      min_valence: 0.7,
      target_energy: 0.8,
      seed_genres: ["happy", "pop", "dance"],
    },
    sad: {
      max_valence: 0.3,
      target_energy: 0.3,
      seed_genres: ["sad", "acoustic", "piano"],
    },
    energetic: {
      min_energy: 0.8,
      target_tempo: 150,
      seed_genres: ["dance", "electronic", "edm"],
    },
    relaxed: {
      max_energy: 0.4,
      target_instrumentalness: 0.5,
      seed_genres: ["ambient", "chill", "sleep"],
    },
    angry: {
      target_energy: 0.8,
      target_valence: 0.2,
      seed_genres: ["metal", "rock", "punk"],
    },
  }

  const moodConfig = moodToFeatures[mood] || {}
  const { seed_genres, ...features } = moodConfig

  try {
    const {
      body: { tracks },
    } = await spotifyApi.getRecommendations({
      limit: 10,
      seed_genres: seed_genres || [mood],
      ...features,
    })

    return tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      preview_url: track.preview_url,
      image: track.album.images[0]?.url,
      external_url: track.external_urls.spotify,
    }))
  } catch (error) {
    console.error("Spotify API Error:", error)
    throw error
  }
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
