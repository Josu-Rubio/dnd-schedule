import { NextRequest, NextResponse } from "next/server";

const clientId = process.env.DISCORD_CLIENT_ID!;
const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
const redirectUri = process.env.DISCORD_REDIRECT_URI!;

// Step 2: Handle the callback from Discord
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Exchange code for access token
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Failed to fetch access token:", tokenData);
    return NextResponse.redirect(new URL("/", req.url));
  }

  const accessToken = tokenData.access_token;

  // Fetch user information
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const userData = await userResponse.json();

  if (!userResponse.ok) {
    console.error("Failed to fetch user data:", userData);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Save user data or handle it
  console.log("User Data:", userData);

  // Redirect to the dashboard or handle the authenticated user
  return NextResponse.redirect(new URL("/", req.url));
}
