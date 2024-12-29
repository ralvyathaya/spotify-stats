'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import Image from 'next/image'

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '')}&scope=user-read-private%20user-read-email%20user-top-read&show_dialog=true`

export default function Home() {
  const [accessToken, setAccessToken] = useState('')
  const [mood, setMood] = useState('')
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    const authError = new URLSearchParams(window.location.search).get('error')

    if (authError) {
      setError(`Authentication error: ${authError}`)
      return
    }

    if (code) {
      setLoading(true)
      setError('')
      
      axios.post('http://localhost:3001/login', { code })
        .then(res => {
          setAccessToken(res.data.accessToken)
          window.history.replaceState({}, '', '/')
        })
        .catch((err) => {
          const errorDetails = err.response?.data?.details || 
                             err.response?.data?.error || 
                             err.message || 
                             'Unknown error occurred'
          console.error('Login failed:', {
            error: errorDetails,
            response: err.response?.data
          })
          setError(`Login failed: ${errorDetails}`)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  useEffect(() => {
    if (!accessToken || !mood) return
    setLoading(true)
    setError('')
    
    axios.get(`http://localhost:3001/recommendations?mood=${mood}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(res => {
        setTracks(res.data)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to get recommendations')
        console.error('Recommendations error:', err.response?.data)
      })
      .finally(() => setLoading(false))
  }, [accessToken, mood])

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.href = '/'}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Mood Tunes</h1>
      {!accessToken ? (
        <Button asChild disabled={loading}>
          <a href={AUTH_URL}>{loading ? 'Loading...' : 'Login with Spotify'}</a>
        </Button>
      ) : (
        <>
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
          
          {loading && <div className="mt-4">Loading songs...</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {tracks.map((track: any) => (
              <Card key={track.id}>
                <CardHeader>
                  <CardTitle>{track.name}</CardTitle>
                  <CardDescription>{track.artists[0].name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Image 
                    src={track.album.images[0].url} 
                    alt={track.name} 
                    width={300}
                    height={300}
                    className="w-full"
                  />
                </CardContent>
                <CardFooter>
                  <Button asChild>
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

