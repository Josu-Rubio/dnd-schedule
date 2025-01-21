// app/calendar/page.tsx
import { cookies } from "next/headers";

import CalendarComponent from '../components/calendarComponent';

import Loader from '../components/loader';
import Image from 'next/image';
import Link from 'next/link';

interface User {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
}

const CalendarPage = async () => {
    // Access user cookie on the server
    const userCookie = (await cookies()).get("user")?.value;

    if (!userCookie) {
        // If no user cookie, return a message or redirect logic
        return (
            <div className="h-screen w-screen flex flex-col overflow-hidden">
                {/* Navigation */}
                <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">D&D Scheduler</h1>
                </nav>

                {/* Main Content */}
                <main
                    className="flex-grow flex items-center justify-center bg-center bg-cover"
                    style={{ backgroundImage: 'url(/background.jpg)' }}
                >
                    <div className="h-full w-full flex items-center justify-center">
                        <Loader />
                    </div>
                </main>
            </div>
        );
    }

    // Parse the user data from the cookie
    const user: User = JSON.parse(userCookie);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <Link
                    className="text-white"
                    href="/"
                >
                    <h1 className="text-xl font-bold">D&D Scheduler</h1>
                </Link>


                <div className="flex items-center space-x-2">
                    {user.avatar && (
                        <Image src={user.avatar} width={100}
                            height={100} alt={`${user.username} avatar`} className="w-8 h-8 rounded-full" />
                    )}
                    <span>{user.username}</span>
                </div>

            </nav>

            <CalendarComponent user={user} />

        </div>


    );
};

export default CalendarPage;
