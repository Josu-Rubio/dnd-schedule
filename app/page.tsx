"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type DayState = "none" | "green" | "yellow";

interface DayVotes {
  green: number;
  yellow: number;
}
interface User {
  username: string;
  avatar: string | null;
  email: string;
}
export default function Home() {
  const [selectedDays, setSelectedDays] = useState<Record<string, DayState>>({});
  const [dayVotes, setDayVotes] = useState<Record<string, DayVotes>>({});
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/user");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, []);

  const toggleDayState = (date: Date) => {
    const dayKey = date.toLocaleDateString("en-CA");

    setSelectedDays((prev) => {
      const currentState = prev[dayKey] || "none";
      const nextState = currentState === "none" ? "green" : currentState === "green" ? "yellow" : "none";

      // Update votes
      setDayVotes((prevVotes) => {
        const currentVotes = prevVotes[dayKey] || { green: 0, yellow: 0 };
        const newVotes = { ...currentVotes };

        if (nextState === "green") {
          newVotes.green += 1;
        } else if (nextState === "yellow") {
          newVotes.green -= 1;
          newVotes.yellow += 1;
        } else {
          newVotes.yellow -= 1;
        }

        return { ...prevVotes, [dayKey]: newVotes };
      });

      return { ...prev, [dayKey]: nextState };
    });

    setHoveredDay(dayKey);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">D&D Scheduler</h1>
        {user ? (
          <div className="flex items-center space-x-2">
            {user.avatar && (
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            )}
            <span>{user.username}</span>
          </div>
        ) : (
          <Link
            href="/api/auth/discord"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Login with Discord
          </Link>
        )}
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center">
        <Calendar
          onClickDay={toggleDayState}
          tileContent={({ date }) => {
            const dayKey = date.toLocaleDateString("en-CA");

            return (
              <div
                className={`w-6 h-6 ${selectedDays[dayKey] === "green"
                  ? "bg-green-500"
                  : selectedDays[dayKey] === "yellow"
                    ? "bg-yellow-400"
                    : ""
                  } rounded-full mx-auto`}
              />
            );
          }}
          tileClassName="cursor-pointer"
        />

        {/* Votes Section */}
        <div className="mt-4 p-4 w-full max-w-2xl bg-gray-100 rounded-md shadow-sm">
          {hoveredDay ? (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Votos para el {formatDate(hoveredDay)}
              </h2>
              <p>
                <span className="text-green-600 font-bold">Perfecto!:</span> {dayVotes[hoveredDay]?.green || 0}
              </p>
              <p>
                <span className="text-yellow-600 font-bold">Quizá:</span> {dayVotes[hoveredDay]?.yellow || 0}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Selecciona una fecha para ver los votos.</p>
          )}
        </div>
      </main>
    </div>
  );
}
