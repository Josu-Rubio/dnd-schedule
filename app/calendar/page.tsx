// app/calendar/page.tsx
import { cookies } from "next/headers";

import CalendarComponent from '../components/calendarComponent';
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
            <div className="h-screen w-screen flex flex-col">
                <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">

                    <h1 className="text-xl font-bold">D&D Scheduler</h1>

                </nav>
                <div className="h-screen flex flex-col items-center justify-center">
                    <p>Bienvenido!</p>
                    <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                        <Link href="/calendar">Mostrar mi Calendario</Link></button>

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
                        <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                    )}
                    <span>{user.username}</span>
                </div>

            </nav>

            <CalendarComponent />

        </div>


    );
};

export default CalendarPage;
