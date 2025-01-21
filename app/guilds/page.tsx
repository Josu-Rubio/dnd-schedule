"use client"

import { useEffect, useState } from "react";
// import { useRouter } from "next/router";

export default function SelectGuild() {
    const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // const router = useRouter();

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchGuilds();
    }, []);

    // const handleSelectGuild = (guild: any) => {
    //     router.push({
    //         pathname: "/calendar",
    //         query: { guildId: guild.id, guildName: guild.name },
    //     });
    // };

    if (loading) {
        return <p>Loading guilds...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h1>Select a Guild</h1>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {guilds.map((guild) => (
                    <li
                        key={guild.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "1rem",
                            cursor: "pointer",
                        }}
                    // onClick={() => handleSelectGuild(guild)}
                    >
                        <img
                            src={guild.icon || "/default-icon.png"}
                            alt={`${guild.name} icon`}
                            style={{ width: "40px", height: "40px", marginRight: "1rem" }}
                        />
                        <span>{guild.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}