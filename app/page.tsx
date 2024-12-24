'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import Image from 'next/image'

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&scope=user-read-private%20user-read-email%20user-top-read`

export default function Home() {
  const [accessToken, setAccessToken] = useState('')
  const [mood, setMood] = useState('')
  const [tracks, setTracks] = useState([])

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      axios.post('http://localhost:3001/login', { code })
        .then(res => {
          setAccessToken(res.data.accessToken)
          window.history.pushState({}, null, '/')
        })
        .catch(() => {
          window.location = '/'
        })
    }
  }, [])

  useEffect(() => {
    if (!accessToken || !mood) return
    axios.get(`http://localhost:3001/recommendations?mood=${mood}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(res => {
        setTracks(res.data)
      })
      .catch(err => console.error(err))
  }, [accessToken, mood])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Mood Tunes</h1>
      {!accessToken ? (
        <Button asChild>
          <a href={AUTH_URL}>Login with Spotify</a>
        </Button>
      ) : (
        <>
          <Select onValueChange={setMood}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select your mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="energetic">Energetic</SelectItem>
            </SelectContent>
          </Select>
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

