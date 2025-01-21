"use client"

import { useEffect, useState } from "react";
import Loader from '../components/loader';

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
    const handleSelectGuild = (guild: any) => {
        // Using window.location to redirect manually
        window.location.href = `/calendar?guildId=${guild.id}&guildName=${guild.name}`;
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
                <h1 className="text-xl font-bold">D&D Scheduler</h1>
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
                                className="flex items-center justify-center cursor-pointer bg-gray-800 text-white p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors m-10"
                                onClick={() => handleSelectGuild(guild)}
                            >
                                <img
                                    src={guild.icon || "/default-icon.png"}
                                    alt={`${guild.name} icon`}
                                    className="w-20 h-20 mb-2 rounded-full m-1"
                                />
                                <span className="text-lg font-semibold">{guild.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
}
