import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import BackButton from '../components/backButton';
import Screen from '../components/screen';


// Type definition for user
interface User {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
}


export default async function Page() {
    // Await the params and searchParams because they are Promises


    // Access user cookie on the server
    const userCookie = (await cookies()).get("user")?.value;

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
                <BackButton />
                <div className="flex items-center space-x-2">
                    {user.avatar && (
                        <Image
                            src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "/default-avatar.png"}
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
                <Screen />
            </main>
        </div>
    );
}
