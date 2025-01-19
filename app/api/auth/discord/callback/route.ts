import { NextRequest, NextResponse } from "next/server";

const clientId = process.env.DISCORD_CLIENT_ID!;
const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
const redirectUri = process.env.DISCORD_REDIRECT_URI!;
const discordTokenUrl = "https://discord.com/api/oauth2/token";
const discordUserUrl = "https://discord.com/api/users/@me";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const tokenResponse = await fetch(discordTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch access token" }, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  const { access_token: accessToken } = tokenData;

  const userResponse = await fetch(discordUserUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }

  const userData = await userResponse.json();
  const userInfo = {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    avatar: userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : null,
  };

  const response = NextResponse.redirect(new URL("/calendar", req.url));

  // Save user info in an HTTP-only cookie
  response.cookies.set("user", JSON.stringify(userInfo), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return response;
}
