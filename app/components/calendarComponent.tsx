"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type DayState = "none" | "green" | "yellow";

interface UserVote {
    userId: string;
    username: string;
    avatar: string | null;
    state: DayState;
}

interface DayVotes {
    green: number;
    yellow: number;
    votes: UserVote[]; // Include user votes in the type
}

interface DayData {
    date: string;
    green: number;
    yellow: number;
    votes: UserVote[];
}

interface CalendarComponentProps {
    user: {
        id: string;
        username: string;
        avatar: string | null;
    };
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ user }) => {
    const [selectedDays, setSelectedDays] = useState<Record<string, DayState>>({});
    const [dayVotes, setDayVotes] = useState<Record<string, DayVotes>>({});
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);


    useEffect(() => {
        const fetchDays = async () => {
            const res = await fetch("/api/calendar");
            const data: DayData[] = await res.json();

            const votes: Record<string, DayVotes> = {};
            const userSelections: Record<string, DayState> = {};

            data.forEach((day) => {
                votes[day.date] = {
                    green: day.green,
                    yellow: day.yellow,
                    votes: day.votes, // Populate votes array
                };

                // Find the user's vote for this day
                const userVote = day.votes.find((vote) => vote.userId === user.id);
                if (userVote) {
                    userSelections[day.date] = userVote.state;
                }
            });

            setDayVotes(votes);
            setSelectedDays(userSelections);
        };

        fetchDays();
    }, [user.id]);

    const toggleDayState = async (date: Date) => {
        const dayKey = date.toLocaleDateString("en-CA");

        setSelectedDays((prev) => {
            const currentState = prev[dayKey] || "none";
            const nextState =
                currentState === "none" ? "green" : currentState === "green" ? "yellow" : "none";

            // Optimistically update the local state
            setDayVotes((prevVotes) => {
                const updatedVotes = { ...prevVotes };
                const votesForDay = updatedVotes[dayKey] || { green: 0, yellow: 0, votes: [] };

                // Update counts locally based on the next state
                if (nextState === "green") {
                    votesForDay.green += 1;
                    votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0; // Adjust yellow count
                } else if (nextState === "yellow") {
                    votesForDay.green -= votesForDay.green > 0 ? 1 : 0; // Adjust green count
                    votesForDay.yellow += 1;
                } else {
                    votesForDay.green -= votesForDay.green > 0 ? 1 : 0;
                    votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0;
                }

                // Update the user in the votes array
                const userIndex = votesForDay.votes.findIndex((v) => v.userId === user.id);
                if (userIndex >= 0) {
                    // Update existing user vote
                    votesForDay.votes[userIndex].state = nextState;
                } else if (nextState !== "none") {
                    // Add new user vote
                    votesForDay.votes.push({
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        state: nextState,
                    });
                }

                updatedVotes[dayKey] = votesForDay;
                return updatedVotes;
            });

            // Call the backend to persist the changes
            if (nextState !== "none") {
                fetch("/api/calendar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: dayKey,
                        state: nextState,
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar,
                    }),
                }).catch((err) => console.error("Failed to update vote:", err));
            }

            return { ...prev, [dayKey]: nextState };
        });

        // Update the hoveredDay information
        setHoveredDay(dayKey);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <main
            className="flex-grow flex flex-col justify-center items-center bg-cover"
            style={{ backgroundImage: "url(/papiro.png)" }}
        >
            <Calendar
                onClickDay={toggleDayState}
                tileContent={({ date }) => {
                    const dayKey = date.toLocaleDateString("en-CA");
                    const state = selectedDays[dayKey];
                    const votes = dayVotes[dayKey] || { green: 0, yellow: 0 };

                    return (
                        <div
                            className={`w-6 h-6 ${state === "green"
                                ? "bg-green-500"
                                : state === "yellow"
                                    ? "bg-yellow-400"
                                    : ""
                                } rounded-full mx-auto`}
                            title={`Green: ${votes.green}, Yellow: ${votes.yellow}`}
                        />
                    );
                }}
                tileClassName="cursor-pointer"
            />

            <div className="mt-4 p-4 min-h-40 w-full max-w-2xl bg-gray-100 rounded-md shadow-sm relative">
                {hoveredDay ? (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Votos para el {formatDate(hoveredDay)}</h2>

                        {/* Top-right summary */}
                        <div className="absolute top-4 right-4 text-sm bg-gray-200 rounded-full px-3 py-1 shadow">
                            <span className="text-green-600 font-bold">Green:</span> {dayVotes[hoveredDay]?.green || 0} |{" "}
                            <span className="text-yellow-600 font-bold">Yellow:</span> {dayVotes[hoveredDay]?.yellow || 0}
                        </div>

                        {/* Green Votes */}
                        <div className="mt-4">
                            <h3 className="text-green-600 font-bold mb-2">Perfecto!</h3>
                            {dayVotes[hoveredDay]?.votes
                                ?.filter((vote) => vote.state === "green")
                                .map((vote) => (
                                    <div key={vote.userId} className="flex items-center mb-2">
                                        <div
                                            className="w-10 h-10 rounded-full border-4 border-green-500 overflow-hidden"
                                            style={{
                                                backgroundImage: `url(${vote.avatar || "/default-avatar.png"})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }}
                                        ></div>
                                        <span className="ml-2 font-medium">{vote.username}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Yellow Votes */}
                        <div className="mt-4">
                            <h3 className="text-yellow-600 font-bold mb-2">Quizá</h3>
                            {dayVotes[hoveredDay]?.votes
                                ?.filter((vote) => vote.state === "yellow")
                                .map((vote) => (
                                    <div key={vote.userId} className="flex items-center mb-2">
                                        <div
                                            className="w-10 h-10 rounded-full border-4 border-yellow-400 overflow-hidden"
                                            style={{
                                                backgroundImage: `url(${vote.avatar || "/default-avatar.png"})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }}
                                        ></div>
                                        <span className="ml-2 font-medium">{vote.username}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Selecciona una fecha para ver los votos.</p>
                )}
            </div>
        </main>
    );
};

export default CalendarComponent;
