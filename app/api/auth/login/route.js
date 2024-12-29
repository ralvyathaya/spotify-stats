import { NextResponse } from "next/server"
import querystring from "querystring"

export async function GET() {
  const scope = "user-read-private user-read-email"

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
    state: Math.random().toString(36).substring(7),
  })

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${queryParams}`
  )
}
