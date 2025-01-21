'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type DayState = 'none' | 'green' | 'yellow';

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
    guild: {
        id?: string;
        name?: string;
        icon?: string
    }
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
    user,
    guild
}) => {
    const [selectedDays, setSelectedDays] = useState<Record<string, DayState>>({});
    const [dayVotes, setDayVotes] = useState<Record<string, DayVotes>>({});
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const res = await fetch(
                    `/api/calendar?guildId=${encodeURIComponent(guild.id || '')}`
                );
                const data: DayData[] = await res.json();

                const votes: Record<string, DayVotes> = {};
                const userSelections: Record<string, DayState> = {};

                data.forEach((day) => {
                    votes[day.date] = {
                        green: day.green,
                        yellow: day.yellow,
                        votes: day.votes,
                    };

                    const userVote = day.votes.find((vote) => vote.userId === user.id);
                    if (userVote) {
                        userSelections[day.date] = userVote.state;
                    }
                });

                setDayVotes(votes);
                setSelectedDays(userSelections);
            } catch (error) {
                console.error('Failed to fetch calendar votes:', error);
            }
        };

        // Polling interval (every 5 seconds)
        const interval = setInterval(fetchVotes, 5000);

        // Initial fetch
        fetchVotes();

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [user.id, guild.id]);

    const toggleDayState = async (date: Date) => {
        const dayKey = date.toLocaleDateString('en-CA');

        setSelectedDays((prev) => {
            const currentState = prev[dayKey] || 'none';
            const nextState =
                currentState === 'none'
                    ? 'green'
                    : currentState === 'green'
                        ? 'yellow'
                        : 'none';

            setDayVotes((prevVotes) => {
                const updatedVotes = { ...prevVotes };
                const votesForDay = updatedVotes[dayKey] || {
                    green: 0,
                    yellow: 0,
                    votes: [],
                };

                if (nextState === 'green') {
                    votesForDay.green += 1;
                    votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0;
                } else if (nextState === 'yellow') {
                    votesForDay.green -= votesForDay.green > 0 ? 1 : 0;
                    votesForDay.yellow += 1;
                } else {
                    votesForDay.green -= votesForDay.green > 0 ? 1 : 0;
                    votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0;
                }

                const userIndex = votesForDay.votes.findIndex((v) => v.userId === user.id);
                if (userIndex >= 0) {
                    votesForDay.votes[userIndex].state = nextState;
                } else if (nextState !== 'none') {
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

            // if (nextState !== 'none') {
            fetch(`/api/calendar?guildId=${encodeURIComponent(guild.id || '')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dayKey,
                    state: nextState,
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    guildId: guild.id,
                }),
            }).catch((err) => console.error('Failed to update vote:', err));
            // } else {
            //     fetch(`/api/calendar?guildId=${encodeURIComponent(guild.id || '')}`, {
            //         method: 'DELETE',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify({
            //             date: dayKey,
            //             userId: user.id,
            //             guildId: guild.id,
            //         }),
            //     }).catch((err) => console.error('Failed to delete vote:', err));
            // }

            return { ...prev, [dayKey]: nextState };
        });

        setHoveredDay(dayKey);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <main
            className="flex-grow flex flex-col justify-center items-center bg-center bg-cover"
            style={{ backgroundImage: 'url(/background.jpg)' }}
        >
            <div className="flex flex-row justify-center items-start w-full max-w-6xl gap-4 px-4 lg:px-8">
                <div className="flex-shrink-0 justify-center w-full lg:w-1/2 p-4">
                    <Calendar
                        onClickDay={toggleDayState}
                        tileContent={({ date }) => {
                            const dayKey = date.toLocaleDateString('en-CA');
                            const state = selectedDays[dayKey];
                            const votes = dayVotes[dayKey] || { green: 0, yellow: 0 };

                            return (
                                <div
                                    className={`w-6 h-6 ${state === 'green'
                                        ? 'bg-green-500'
                                        : state === 'yellow'
                                            ? 'bg-yellow-400'
                                            : ''
                                        } rounded-full mx-auto`}
                                    title={`Green: ${votes.green}, Yellow: ${votes.yellow}`}
                                />
                            );
                        }}
                        tileClassName="cursor-pointer"
                        tileDisabled={({ date }) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                        }}
                    />
                </div>
                <div className="w-full lg:w-1/2 p-4 bg-white/70 rounded-md shadow-md overflow-auto">
                    <h1 className="text-center text-xl font-bold">
                        <div className="flex items-center justify-center space-x-2"><Image src={guild ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : "/default-avatar.png"} width={32}
                            height={32}
                            alt={`${user.username} avatar`}
                            className="w-8 h-8 rounded-full" />
                            <span>{guild.name ? `${decodeURIComponent(guild.name)}` : 'No Guild'}</span>
                        </div>
                    </h1>
                    {hoveredDay ? (
                        <div>
                            <h2 className="text-lg font-semibold mb-2">
                                Votes for {formatDate(hoveredDay)}
                            </h2>
                            {/* Green Votes */}
                            <div className='mt-4'>
                                <h3 className='text-black font-bold mb-2 underline decoration-green-500'>
                                    Perfecto!
                                </h3>
                                {dayVotes[hoveredDay]?.votes
                                    ?.filter((vote) => vote.state === 'green')
                                    .map((vote) => (
                                        <div key={vote.userId} className='flex items-center mb-2'>
                                            <div
                                                className='w-10 h-10 rounded-full border-4 border-green-500 overflow-hidden'
                                                style={{
                                                    backgroundImage: `url(${user.avatar ? `https://cdn.discordapp.com/avatars/227888648778022914/${user.avatar}.png` : "/default-avatar.png"})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}></div>
                                            <span className='ml-2 font-medium'>{vote.username}</span>
                                        </div>
                                    ))}
                            </div>

                            {/* Yellow Votes */}
                            <div className='mt-4'>
                                <h3 className='text-black font-bold mb-2 underline decoration-yellow-400'>
                                    Quizá
                                </h3>
                                {dayVotes[hoveredDay]?.votes
                                    ?.filter((vote) => vote.state === 'yellow')
                                    .map((vote) => (
                                        <div key={vote.userId} className='flex items-center mb-2'>
                                            <div
                                                className='w-10 h-10 rounded-full border-4 border-yellow-400 overflow-hidden'
                                                style={{
                                                    backgroundImage: `url(${user.avatar ? `https://cdn.discordapp.com/avatars/227888648778022914/${user.avatar}.png` : "/default-avatar.png"})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}></div>
                                            <span className='ml-2 font-medium'>{vote.username}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Select a date to see votes.</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default CalendarComponent;
