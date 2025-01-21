import { NextRequest, NextResponse } from "next/server";

const discordGuildsUrl = "https://discord.com/api/users/@me/guilds";

interface Guild {
    id: string;
    name: string;
    icon?: string | null; // Icon is optional and can be null if not provided
}

export async function GET(req: NextRequest) {
    // Get the access token from cookies
    const accessToken = req.cookies.get("discord_token");

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's guilds
    const guildsResponse = await fetch(discordGuildsUrl, {
        headers: {
            Authorization: `Bearer ${accessToken.value}`,
        },
    });

    if (!guildsResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch guilds" }, { status: guildsResponse.status });
    }

    const guildsData = await guildsResponse.json();

    // Define the allowed guild IDs
    const allowedGuildIds = [
        "304091554467807234", // ID for "La Caverna del Vicio"
        "1214249928772165632", // ID for "Nos falta calle"
    ];

    // Filter guilds to include only the allowed ones
    const filteredGuilds = guildsData.filter(guild => {
        return allowedGuildIds.includes(guild.id);
    });

    // Map the guild data to include only the necessary fields
    const guilds = filteredGuilds.map((guild: Guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : null, // Default icon if none is present
    }));

    return NextResponse.json({ guilds });
}