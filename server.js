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

app.get("/login", (req, res) => {
  const scopes = ["user-read-private", "user-read-email", "user-top-read"]
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes)
  res.json({ url: authorizeURL })
})

app.post("/callback", async (req, res) => {
  const { code } = req.body
  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body
    spotifyApi.setAccessToken(access_token)
    spotifyApi.setRefreshToken(refresh_token)
    res.json({ access_token, refresh_token })
  } catch (error) {
    res.status(400).json({ error: "Error during authentication" })
  }
})

app.get("/recommendations", async (req, res) => {
  const { mood } = req.query
  try {
    const recommendations = await getRecommendations(mood)
    res.json(recommendations)
  } catch (error) {
    res.status(400).json({ error: "Error fetching recommendations" })
  }
})

async function getRecommendations(mood) {
  const moodToFeatures = {
    happy: { min_valence: 0.7, target_energy: 0.8 },
    sad: { max_valence: 0.3, target_energy: 0.3 },
    energetic: { min_energy: 0.8, target_tempo: 150 },
    relaxed: { max_energy: 0.4, target_instrumentalness: 0.5 },
    angry: { target_energy: 0.8, target_valence: 0.2 },
  }

  const features = moodToFeatures[mood] || {}
  const { tracks } = await spotifyApi.getRecommendations({
    limit: 10,
    seed_genres: [mood],
    ...features,
  })

  return tracks.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    preview_url: track.preview_url,
  }))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
