"use client";

import Link from 'next/link';
import CalendarComponent from './components/calendarComponent';

export default function Home() {

  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">D&D Scheduler</h1>

        <Link
          href="/api/auth/discord"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Login with Discord
        </Link>

      </nav>

      <main className="flex-grow flex flex-col justify-center items-center">

      </main>
    </div>
  );
}
