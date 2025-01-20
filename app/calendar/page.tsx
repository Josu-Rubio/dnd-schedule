// app/calendar/page.tsx
import { cookies } from "next/headers";

import CalendarComponent from '../components/calendarComponent';

import Loader from '../components/loader';
import Image from 'next/image';

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
            <div className="h-screen w-screen flex flex-col">
                <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">

                    <h1 className="text-xl font-bold">D&D Scheduler</h1>

                </nav>
                <div className="h-screen flex flex-col items-center justify-center">

                    <Loader />

                </div>
            </div>
        );
    }

    // Parse the user data from the cookie
    const user: User = JSON.parse(userCookie);

    return (
        <div className="h-screen w-screen flex flex-col">
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">

                <h1 className="text-xl font-bold">D&D Scheduler</h1>

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
