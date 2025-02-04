import { cookies } from "next/headers";
import CalendarComponent from "../components/calendarComponent";
import Image from "next/image";
import Link from "next/link";

// Type definition for user
interface User {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
}

// Define the type for the props
interface PageProps {
    params: Promise<{ guildId: string }>;
    searchParams: Promise<{ guildId?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
    // Await the params and searchParams because they are Promises
    const { guildId } = await searchParams; // This resolves the searchParams promise
    const { guildId: paramGuildId } = await params; // This resolves the params promise

    const effectiveGuildId = guildId || paramGuildId; // Use whichever is available

    let guildInfo = {};

    // If no guildId, show an error message
    if (!effectiveGuildId) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-gray-500">Guild information is missing from the URL.</p>
            </div>
        );
    }


    // Access user cookie on the server
    const userCookie = (await cookies()).get("user")?.value;
    let guildCookie = (await cookies()).get("guilds")?.value;

    if (!guildCookie) {
        console.warn("No guilds found in the cookie. Using default guild.");

        guildCookie = JSON.stringify([
            {
                id: "304091554467807234",
                name: "La Caverna Del Vicio",
                icon: "a_57449245f2c0dcc08a7936cd5cc7aeff",
                banner: "84ac9245d424e8b7f475405d5f3ef68a",
                owner: false,
                permissions: 2004877025,
                permissions_new: "2230883180347105",
                features: [
                    "ENABLED_DISCOVERABLE_BEFORE",
                    "INVITE_SPLASH",
                    "DISCOVERABLE",
                    "AUTO_MODERATION",
                    "PREVIEW_ENABLED",
                    "CHANNEL_ICON_EMOJIS_GENERATED",
                    "ANIMATED_ICON",
                    "MEMBER_VERIFICATION_GATE_ENABLED",
                    "COMMUNITY",
                    "SOUNDBOARD",
                    "WELCOME_SCREEN_ENABLED",
                    "TEXT_IN_VOICE_ENABLED",
                    "NEWS",
                    "NEW_THREAD_PERMISSIONS",
                    "THREE_DAY_THREAD_ARCHIVE",
                    "THREADS_ENABLED",
                ],
            },
        ]);
    }

    try {
        // Parse the cookie value
        const guilds = JSON.parse(guildCookie);

        // Replace this with your target ID
        const targetGuildId = effectiveGuildId;

        // Find the guild by ID
        const targetGuild = guilds.find((guild: { id: string }) => guild.id === targetGuildId);

        if (!targetGuild) {
            console.error("Guild with the specified ID not found.");
            return null; // Or handle the missing guild appropriately
        }

        // Extract the desired fields
        const { id, name, icon } = targetGuild;

        guildInfo = { id, name, icon };

        // You can now use `id`, `name`, and `icon` as needed
    } catch (error) {
        console.error("Error parsing guild cookie:", error);
    }

    if (!userCookie) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Not Logged In</h1>
                <p className="text-gray-500">Please log in to access the calendar.</p>
            </div>
        );
    }

    // Parse the user data from the cookie
    const user: User = JSON.parse(userCookie);

    return (
        <div className="h-screen w-screen flex flex-col ">
            {/* Navigation */}
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <Link href="/" className="text-white">
                    <h1 className="text-xl font-bold">D&D Scheduler</h1>
                </Link>
                {effectiveGuildId === "1214249928772165632" ? <Link href="/sessions" className="bg-gray-900 px-4 py-2 rounded hover:bg-gray-950">Sesiones</Link> : <></>}
                <div className="flex items-center space-x-2">
                    {user.avatar && (
                        <Image
                            src={`${user.avatar
                                ? user.avatar.startsWith('http')
                                    ? user.avatar
                                    : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                                : '/default-avatar.png'
                                }`}
                            width={32}
                            height={32}
                            alt={`${user.username} avatar`}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span>{user.username}</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex flex-col bg-gray-100">
                <CalendarComponent user={user} guild={guildInfo} />
            </main>
        </div>
    );
}
