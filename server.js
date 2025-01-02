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

  // Validate mood parameter
  if (!mood) {
    return res.status(400).json({ error: "Mood parameter is required" })
  }

  // Validate authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Valid authorization token is required" })
  }

  try {
    const token = authHeader.split(" ")[1]
    spotifyApi.setAccessToken(token)

    // Verify the token is valid by making a test request
    try {
      await spotifyApi.getMe()
    } catch (error) {
      if (error.statusCode === 401) {
        return res.status(401).json({ error: "Token expired or invalid" })
      }
      throw error
    }

    // Get recommendations
    const recommendations = await getRecommendations(mood)

    // Send response
    res.json(recommendations)
  } catch (error) {
    console.error("Recommendations Error:", error)

    // Handle specific error cases
    if (error.statusCode === 401) {
      return res.status(401).json({ error: "Token expired or invalid" })
    }

    if (error.statusCode === 429) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        retryAfter: error.headers?.["retry-after"] || 30,
      })
    }

    // Handle genre-related errors
    if (error.message?.includes("genre")) {
      return res.status(400).json({
        error: "Invalid genre configuration",
        details: error.message,
      })
    }

    // Generic error response
    res.status(error.statusCode || 500).json({
      error: error.message || "Error fetching recommendations",
      details:
        process.env.NODE_ENV === "development" ? error.toString() : undefined,
    })
  }
})

async function getRecommendations(mood) {
  // Define mood configurations with more common genres
  const moodToFeatures = {
    happy: {
      target_valence: 0.8,
      target_energy: 0.8,
      seed_genres: ["pop", "dance", "happy"],
      min_popularity: 50,
    },
    sad: {
      target_valence: 0.2,
      target_energy: 0.3,
      seed_genres: ["acoustic", "sad", "piano"],
      min_popularity: 50,
    },
    energetic: {
      target_energy: 0.9,
      target_tempo: 150,
      seed_genres: ["electronic", "dance", "party"],
      min_popularity: 50,
    },
    relaxed: {
      target_energy: 0.3,
      target_instrumentalness: 0.5,
      seed_genres: ["ambient", "chill", "study"],
      min_popularity: 50,
    },
    angry: {
      target_energy: 0.8,
      target_valence: 0.3,
      seed_genres: ["rock", "metal", "intense"],
      min_popularity: 50,
    },
  }

  try {
    // First, get available genre seeds from Spotify
    const {
      body: { genres: availableGenres },
    } = await spotifyApi.getAvailableGenreSeeds()
    console.log("Available genres:", availableGenres)

    // Get mood config or default to happy
    const moodConfig = moodToFeatures[mood] || moodToFeatures.happy

    // Filter to only use available genres and limit to 2 seeds
    const validGenres = moodConfig.seed_genres
      .filter((genre) => availableGenres.includes(genre))
      .slice(0, 2)

    console.log("Using genres:", validGenres)

    // If no valid genres found, use most common genres
    if (validGenres.length === 0) {
      validGenres.push("pop")
      if (availableGenres.includes("rock")) {
        validGenres.push("rock")
      }
    }

    // Prepare recommendation options
    const recommendationOptions = {
      limit: 10,
      seed_genres: validGenres,
      min_popularity: moodConfig.min_popularity || 50,
      ...moodConfig,
    }

    // Remove seed_genres from audio features
    delete recommendationOptions.seed_genres

    // Get recommendations with validated genres
    const { body } = await spotifyApi.getRecommendations({
      seed_genres: validGenres,
      ...recommendationOptions,
    })

    if (!body.tracks || body.tracks.length === 0) {
      throw new Error("No tracks found for the given mood")
    }

    // Map the response to our format
    return body.tracks.map((track) => ({
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
    // Add more detailed error logging
    if (error.statusCode) {
      console.error("Status Code:", error.statusCode)
      console.error("Error Body:", error.body)
    }
    throw error
  }
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
