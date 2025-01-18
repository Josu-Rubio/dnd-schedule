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
    // Step 1: Redirect user to Discord's OAuth2 authorization endpoint
    const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
    discordAuthUrl.searchParams.append("client_id", clientId);
    discordAuthUrl.searchParams.append("redirect_uri", redirectUri);
    discordAuthUrl.searchParams.append("response_type", "code");
    discordAuthUrl.searchParams.append("scope", "identify email");

    return NextResponse.redirect(discordAuthUrl.toString());
  } else {
    // Step 2: Exchange authorization code for access token
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(discordTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch access token" },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token: accessToken } = tokenData;

    // Step 3: Fetch user info using the access token
    const userResponse = await fetch(discordUserUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user info" },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();

    // Step 4: Store user info in a session or cookie
    const userInfo = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        : null,
      email: userData.email,
    };

    // Store in a cookie for simplicity (You can implement session storage)
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("user", JSON.stringify(userInfo), {
      path: "/",
      httpOnly: false, // For demo purposes, use secure options in production
    });

    return response;
  }
}
