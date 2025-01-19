// app/calendar/page.tsx
import { cookies } from "next/headers";

import CalendarComponent from '../components/calendarComponent';

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
            <div>
                <p>You are not logged in. Please log in to access your calendar.</p>
                <a href="/">Go to Login</a>
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
