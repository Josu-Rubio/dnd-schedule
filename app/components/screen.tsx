"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Screen = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const router = useRouter(); // Hook for handling navigation

    useEffect(() => {
        async function fetchGuilds() {
            try {
                const response = await fetch("/api/get-guilds");

                if (!response.ok) {
                    throw new Error("Failed to fetch guilds");
                }

                const data = await response.json();


                // Check if the guild with ID "1214249928772165632" exists
                const guildExists = data.guilds.some(guild => guild.id === "1214249928772165632");

                if (!guildExists) {
                    // Redirect to home page if the guild doesn't exist
                    router.push("/");
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        fetchGuilds();
    }, [router]);

    // Example list of YouTube video links and titles
    const videos = [
        { id: "video1", youtubeLink: "https://www.youtube.com/embed/x76EGAzfXUc", title: "00. Despedida de Calas" },
        { id: "video2", youtubeLink: "https://www.youtube.com/embed/CVkv67jwB9E", title: "01. Mercado de Skaler" },
        // { id: "video3", youtubeLink: "https://www.youtube.com/embed/ScMzIvxBSi4", title: "Video 3" },
    ];


    return (
        <main
            className="flex h-screen "

        >
            {/* Left Section - List of video titles */}
            <aside className="w-1/4 bg-gray-800 text-white p-4 ">
                <h2 className="text-lg font-bold mb-4">Partidas</h2>
                <ul className="space-y-4">
                    {videos.map((video) => (
                        <li
                            key={video.id}
                            className="cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <p className="text-sm">{video.title}</p>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Right Section - Embedded YouTube video */}
            <section className=" w-3/4 bg-white flex items-center justify-center p-4">
                {selectedVideo ? (
                    <div className="flex flex-col w-full ">
                        <div className="w-full h-0 pb-[56.25%] relative">
                            <iframe
                                src={selectedVideo.youtubeLink}
                                title={selectedVideo.title}
                                className="absolute top-0 left-0 w-full h-4/5"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Select a video to view its details.</p>
                )}
            </section>
        </main>
    );
};

export default Screen;
