"use client"

import { useEffect, useState } from "react";
import Loader from '../components/loader';
import Link from 'next/link';
import Image from 'next/image';

export default function SelectGuild() {
    const [guilds, setGuilds] = useState([]);

    useEffect(() => {
        async function fetchGuilds() {
            try {
                const response = await fetch("/api/get-guilds");

                if (!response.ok) {
                    throw new Error("Failed to fetch guilds");
                }

                const data = await response.json();
                setGuilds(data.guilds);
            } catch (err) {
                console.log(err.message);
            }
        }

        fetchGuilds();
    }, []);

    // Redirect to the calendar page with the selected guild information
    const handleSelectGuild = (id: string, name: string) => {
        // Ensure guild.id and guild.name are strings and properly encoded for URL
        const guildId = encodeURIComponent(id.toString()); // Ensure it's a string and URL-safe
        const guildName = encodeURIComponent(name); // URL-safe string encoding

        // Now navigate to the calendar page with the query parameters
        window.location.href = `/calendar?guildId=${guildId}`;
    };

    if (guilds.length <= 0) {
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

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden">
            {/* Navigation */}
            <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <Link
                    className="text-white"
                    href="/"
                >
                    <h1 className="text-xl font-bold">D&D Scheduler</h1>
                </Link>
            </nav>

            {/* Main Content */}
            <main
                className="flex-grow flex items-center justify-center bg-center bg-cover"
                style={{ backgroundImage: 'url(/background.jpg)' }}
            >
                <div className="h-full w-full flex items-center justify-center">
                    <ul className="flex flex-col items-center justify-center">
                        {guilds.map((guild) => (
                            <li
                                key={guild.id}
                                className="flex items-center justify-center cursor-pointer bg-gray-800 text-white p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors m-2"
                                onClick={() => handleSelectGuild(guild.id, guild.name)}
                            >

                                <Image
                                    src={guild.icon}
                                    width={100}
                                    height={100}
                                    alt={`${guild.name} avatar`}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="m-2 text-lg font-semibold">{guild.name}</span>

                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}
