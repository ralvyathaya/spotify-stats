import { NextResponse } from "next/server"
import querystring from "querystring"
import axios from "axios"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    const { access_token, refresh_token } = response.data

    // Redirect to home page with access token in URL
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("access_token", access_token)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Auth Error:", error.response?.data || error.message)
    const errorUrl = new URL("/", request.url)
    errorUrl.searchParams.set("error", "Authentication failed")
    return NextResponse.redirect(errorUrl)
  }
}
