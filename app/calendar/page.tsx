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
    const guildCookie = (await cookies()).get("guilds")?.value;

    if (!guildCookie) {
        console.error("No guilds found in the cookie.");
        return null; // Or handle the error appropriately
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
                <div className="flex items-center space-x-2">
                    {user.avatar && (
                        <Image
                            src={"/default-avatar.png"}
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
