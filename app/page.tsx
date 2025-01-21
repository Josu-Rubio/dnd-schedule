"use client";
// app/page.tsx

import Link from 'next/link';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Home() {


  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">D&D Scheduler</h1>

        <Link
          href="/api/auth/discord"
          className="bg-violet-900 px-4 py-2 rounded hover:bg-violet-950"
        >
          Discord Login
        </Link>

      </nav>
      <main className="flex-grow flex flex-col justify-center items-center bg-center bg-cover" style={{ backgroundImage: 'url(/background.jpg)' }}>
        <h2 className="text-white text-3xl mb-8 font-bold" style={{ textShadow: "2px 2px #000000" }}>
          Bienvenido al calendario
        </h2>
        <SpeedInsights />
      </main>

    </div>
  );
}
