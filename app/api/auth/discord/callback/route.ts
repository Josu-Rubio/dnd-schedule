import { NextRequest, NextResponse } from "next/server";

const clientId = process.env.DISCORD_CLIENT_ID!;
const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
const redirectUri = process.env.DISCORD_REDIRECT_URI!;
const discordTokenUrl = "https://discord.com/api/oauth2/token";
const discordUserUrl = "https://discord.com/api/users/@me";
const discordGuildsUrl = "https://discord.com/api/users/@me/guilds";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Exchange code for access token
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

    // Fetch user info
    const userResponse = await fetch(discordUserUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
    }

    const userData = await userResponse.json();

    // Fetch user's guilds
    const guildsResponse = await fetch(discordGuildsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!guildsResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch user guilds" }, { status: 500 });
    }

    const guildsData = await guildsResponse.json();

    // Filter guilds if needed (e.g., admin permissions)
    // const filteredGuilds = guildsData.filter(guild => {
    //     const adminPermission = 0x8; // ADMINISTRATOR permission bit
    //     return (guild.permissions & adminPermission) === adminPermission;
    // });

    // console.log("filteredGuilds", filteredGuilds)

    const response = NextResponse.redirect(new URL("/guilds", req.url));

    // Save user info, guilds, discord Token
    response.cookies.set("discord_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    response.cookies.set("user", JSON.stringify(userData), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    response.cookies.set("guilds", JSON.stringify(guildsData), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });



    return response;
}
