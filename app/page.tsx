'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import Image from 'next/image'

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '')}&scope=user-read-private%20user-read-email%20user-top-read%20user-library-read&show_dialog=true`

export default function Home() {
  const [accessToken, setAccessToken] = useState('')
  const [mood, setMood] = useState('')
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for access token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('access_token')
    const urlError = urlParams.get('error')

    if (token) {
      console.log('Token received')
      setAccessToken(token)
      // Clean URL
      window.history.replaceState({}, '', '/')
    } else if (urlError) {
      console.error('Auth error:', urlError)
      setError(urlError)
    }
  }, [])

  useEffect(() => {
    if (!accessToken || !mood) return
    setLoading(true)
    setError('')
    
    console.log('Fetching recommendations for mood:', mood)
    axios.get(`http://localhost:3001/recommendations?mood=${mood}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(res => {
        console.log('Recommendations received:', res.data.length)
        setTracks(res.data)
      })
      .catch(err => {
        const errorMessage = err.response?.data?.details || 
                           err.response?.data?.error || 
                           'Failed to get recommendations'
        console.error('Recommendations error:', errorMessage)
        setError(errorMessage)
      })
      .finally(() => setLoading(false))
  }, [accessToken, mood])

  const handleLogout = () => {
    setAccessToken('')
    setMood('')
    setTracks([])
    window.location.href = '/'
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.href = '/'}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Mood Tunes</h1>
        {accessToken && (
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>

      {!accessToken ? (
        <div className="text-center">
          <h2 className="text-xl mb-4">Get personalized music recommendations based on your mood</h2>
          <Button asChild disabled={loading}>
            <a href={AUTH_URL}>{loading ? 'Loading...' : 'Login with Spotify'}</a>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl mb-2">How are you feeling today?</h2>
            <Select onValueChange={setMood} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="energetic">Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading && <div className="text-center mt-4">Finding the perfect songs for your mood...</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {tracks.map((track: any) => (
              <Card key={track.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{track.name}</CardTitle>
                  <CardDescription>{track.artists[0].name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image 
                    src={track.album.images[0].url} 
                    alt={track.name} 
                    width={300}
                    height={300}
                    className="w-full rounded-md"
                  />
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                      Listen on Spotify
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}