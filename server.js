import express from "express"
import cors from "cors"
import SpotifyWebApi from "spotify-web-api-node"
import dotenv from "dotenv"

dotenv.config()

const app = express()

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

app.get("/", (req, res) => {
  res.json({ message: "Mood Tunes API is running" })
})

app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
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
    spotifyApi.setAccessToken(access_token)
    spotifyApi.setRefreshToken(refresh_token)
    res.redirect(
      `${process.env.CLIENT_URL}?access_token=${access_token}&refresh_token=${refresh_token}`
    )
  } catch (error) {
    console.error("Auth Error:", error)
    res.redirect(`${process.env.CLIENT_URL}?error=authentication_failed`)
  }
})

// Get user's top tracks
app.get("/top-tracks", async (req, res) => {
  const { time_range = "short_term" } = req.query
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Valid authorization token is required" })
  }

  try {
    const token = authHeader.split(" ")[1]
    spotifyApi.setAccessToken(token)

    const data = await spotifyApi.getMyTopTracks({
      limit: 20,
      time_range, // short_term (4 weeks), medium_term (6 months), long_term (years)
    })

    const tracks = data.body.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      popularity: track.popularity,
    }))

    res.json(tracks)
  } catch (error) {
    handleApiError(error, res)
  }
})

// Get user's top artists
app.get("/top-artists", async (req, res) => {
  const { time_range = "short_term" } = req.query
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Valid authorization token is required" })
  }

  try {
    const token = authHeader.split(" ")[1]
    spotifyApi.setAccessToken(token)

    const data = await spotifyApi.getMyTopArtists({
      limit: 20,
      time_range,
    })

    const artists = data.body.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url,
      genres: artist.genres,
      popularity: artist.popularity,
      external_url: artist.external_urls.spotify,
    }))

    res.json(artists)
  } catch (error) {
    handleApiError(error, res)
  }
})

// Get user's recently played tracks
app.get("/recently-played", async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Valid authorization token is required" })
  }

  try {
    const token = authHeader.split(" ")[1]
    spotifyApi.setAccessToken(token)

    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 })

    const tracks = data.body.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      image: item.track.album.images[0]?.url,
      played_at: item.played_at,
      external_url: item.track.external_urls.spotify,
    }))

    // Group tracks by hour of day
    const tracksByHour = tracks.reduce((acc, track) => {
      const hour = new Date(track.played_at).getHours()
      if (!acc[hour]) acc[hour] = []
      acc[hour].push(track)
      return acc
    }, {})

    res.json({
      tracks,
      analytics: {
        tracksByHour,
        totalTracks: tracks.length,
        uniqueTracks: new Set(tracks.map((t) => t.id)).size,
      },
    })
  } catch (error) {
    handleApiError(error, res)
  }
})

// Get user's current playing track
app.get("/now-playing", async (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Valid authorization token is required" })
  }

  try {
    const token = authHeader.split(" ")[1]
    spotifyApi.setAccessToken(token)

    const data = await spotifyApi.getMyCurrentPlayingTrack()

    if (!data.body || !data.body.item) {
      return res.json(null)
    }

    const track = {
      id: data.body.item.id,
      name: data.body.item.name,
      artist: data.body.item.artists[0].name,
      album: data.body.item.album.name,
      image: data.body.item.album.images[0]?.url,
      progress_ms: data.body.progress_ms,
      duration_ms: data.body.item.duration_ms,
      external_url: data.body.item.external_urls.spotify,
      is_playing: data.body.is_playing,
    }

    res.json(track)
  } catch (error) {
    handleApiError(error, res)
  }
})

function handleApiError(error, res) {
  console.error("API Error:", error)

  if (error.statusCode === 401) {
    return res.status(401).json({ error: "Token expired or invalid" })
  }

  if (error.statusCode === 429) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: error.headers?.["retry-after"] || 30,
    })
  }

  res.status(error.statusCode || 500).json({
    error: error.message || "An error occurred",
    details:
      process.env.NODE_ENV === "development" ? error.toString() : undefined,
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
