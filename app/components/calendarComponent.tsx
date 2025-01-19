"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type DayState = "none" | "green" | "yellow";

interface DayVotes {
    green: number;
    yellow: number;
}

interface UserVote {
    userId: string;
    state: DayState;
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

    console.log("user", user)

    useEffect(() => {
        // Fetch existing day data
        const fetchDays = async () => {
            const res = await fetch("/api/calendar");
            const data: DayData[] = await res.json();

            const votes: Record<string, DayVotes> = {};
            const userSelections: Record<string, DayState> = {};

            data.forEach((day) => {
                votes[day.date] = { green: day.green, yellow: day.yellow };

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

        setSelectedDays((prevSelectedDays) => {
            const currentState = prevSelectedDays[dayKey] || "none";
            const nextState =
                currentState === "none" ? "green" : currentState === "green" ? "yellow" : "none";

            // Optimistically update dayVotes
            setDayVotes((prevDayVotes) => {
                const currentVotes = prevDayVotes[dayKey] || { green: 0, yellow: 0 };
                const updatedVotes = { ...currentVotes };

                // Adjust vote counts based on the next state
                if (currentState === "none" && nextState === "green") {
                    updatedVotes.green += 1;
                } else if (currentState === "green" && nextState === "yellow") {
                    updatedVotes.green -= 1;
                    updatedVotes.yellow += 1;
                } else if (currentState === "yellow" && nextState === "none") {
                    updatedVotes.yellow -= 1;
                }

                return { ...prevDayVotes, [dayKey]: updatedVotes };
            });

            // Send the update to the backend
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

            return { ...prevSelectedDays, [dayKey]: nextState };
        });

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

            <div className="mt-4 p-4 min-h-40 w-full max-w-2xl bg-gray-100 rounded-md shadow-sm">
                {hoveredDay ? (
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Votos para el {formatDate(hoveredDay)}</h2>
                        <p>
                            <span className="text-green-600 font-bold">Perfecto!:</span>{" "}
                            {dayVotes[hoveredDay]?.green || 0}
                        </p>
                        <p>
                            <span className="text-yellow-600 font-bold">Quizá:</span>{" "}
                            {dayVotes[hoveredDay]?.yellow || 0}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Selecciona una fecha para ver los votos.</p>
                )}
            </div>
        </main>
    );
};

export default CalendarComponent;
