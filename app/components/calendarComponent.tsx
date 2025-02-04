'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendarComponent.css';

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
        icon?: string;
    };
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
    user,
    guild,
}) => {
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
            } catch (error) {
                console.error('Failed to fetch calendar votes:', error);
            }
        };

        // Initial fetch
        fetchVotes();
    }, [user.id, guild.id]);

    const toggleDay = async (date: Date) => {
        const dayKey = date.toLocaleDateString('en-CA');
        setHoveredDay(dayKey);
    };

    const handleVote = async (state) => {
        const dayKey = hoveredDay;

        // Optimistically update the UI
        const rollbackVotes = JSON.parse(JSON.stringify(dayVotes)); // Deep copy for rollback

        setDayVotes((prevVotes) => {
            const updatedVotes = { ...prevVotes };
            const votesForDay = updatedVotes[dayKey] || {
                green: 0,
                yellow: 0,
                votes: [],
            };

            // Adjust vote counts
            if (state === 'green') {
                votesForDay.green += 1;
                votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0;
            } else if (state === 'yellow') {
                votesForDay.green -= votesForDay.green > 0 ? 1 : 0;
                votesForDay.yellow += 1;
            } else if (state === 'none') {
                votesForDay.green -= votesForDay.green > 0 ? 1 : 0;
                votesForDay.yellow -= votesForDay.yellow > 0 ? 1 : 0;
            }

            // Update or add the user vote in the votes array
            const userIndex = votesForDay.votes.findIndex(
                (v) => v.userId === user.id
            );
            if (userIndex >= 0) {
                // Update the user's vote
                votesForDay.votes[userIndex].state = state;
            } else {
                // Add a new vote with the current state
                votesForDay.votes.push({
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    state,
                });
            }

            updatedVotes[dayKey] = votesForDay;
            return updatedVotes;
        });

        // Send the updated state to the server
        try {
            const response = await fetch(
                `/api/calendar?guildId=${encodeURIComponent(guild.id || '')}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: dayKey,
                        state,
                        userId: user.id,
                        username: user.username,
                        avatar: user.avatar ? user.avatar : 'default-avatar.png',
                        guildId: guild.id,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update vote');
            }
        } catch (err) {
            console.error('Error updating vote:', err);

            // Rollback optimistic update on error
            setDayVotes(rollbackVotes);
        }
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
            className='flex-grow flex flex-col justify-center items-center bg-center bg-cover'
            style={{
                backgroundImage: 'url(/background.jpg)',
            }}>
            <div className='container'>
                {/* Calendar Section */}
                <div className='flex-shrink-0 justify-center items-center w-full lg:w-1/2 p-4 overflow-auto'>
                    <Calendar
                        onClickDay={toggleDay}
                        tileContent={({ date }) => {
                            const dayKey = date.toLocaleDateString('en-CA');
                            const votes = dayVotes[dayKey] || {
                                green: 0,
                                yellow: 0,
                                votes: [],
                            };

                            // Get the current user's vote for this day
                            const currentUserVote = votes.votes.find(
                                (vote) => vote.userId === user.id
                            );
                            const userState = currentUserVote?.state || 'none';

                            return (
                                <div
                                    className={`w-6 h-6 ${userState === 'green'
                                        ? 'bg-green-500'
                                        : userState === 'yellow'
                                            ? 'bg-yellow-400'
                                            : userState === 'none'
                                                ? ''
                                                : ''
                                        } rounded-full mx-auto`}
                                    title={`Green: ${votes.green}, Yellow: ${votes.yellow}`}
                                />
                            );
                        }}
                        tileClassName='cursor-pointer'
                        tileDisabled={({ date }) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                        }}
                    />
                </div>

                {/* Right Section (Votes or Message) */}
                <div
                    className='w-full lg:w-1/2 p-4 bg-white/70 rounded-md shadow-md overflow-auto'
                    style={{ height: 'auto', maxHeight: '600px' }}>
                    <h1 className='text-center text-xl font-bold mb-2'>
                        <div className='flex items-center justify-center space-x-2'>
                            <Image
                                src={
                                    guild
                                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                                        : '/default-avatar.png'
                                }
                                width={32}
                                height={32}
                                alt={`${user.username} avatar`}
                                className='w-8 h-8 rounded-full'
                            />
                            <span>
                                {guild.name ? `${decodeURIComponent(guild.name)}` : 'No Guild'}
                            </span>
                        </div>
                    </h1>
                    <div className='mx-auto w-[100%] h-[2px] bg-black mb-2'></div>
                    {hoveredDay ? (
                        <div>
                            <h2 className='text-lg font-semibold mb-2'>
                                Votos para el {formatDate(hoveredDay)}
                            </h2>
                            <div className='flex justify-around'>
                                {/* Voting Buttons */}
                                <button
                                    className={`text-black bg-green-500 px-6 py-3 rounded hover:bg-green-700 transition duration-200
                            ${dayVotes[hoveredDay]?.votes?.some(
                                        (vote) =>
                                            vote.userId === user.id &&
                                            vote.state === 'green'
                                    )
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'shadow-lg'
                                        }`}
                                    disabled={dayVotes[hoveredDay]?.votes?.some(
                                        (vote) => vote.userId === user.id && vote.state === 'green'
                                    )}
                                    onClick={() => handleVote('green')}>
                                    Me apunto!
                                </button>
                                <button
                                    className={`text-black bg-yellow-400 px-6 py-3 rounded hover:bg-yellow-600 transition duration-200
                            ${dayVotes[hoveredDay]?.votes?.some(
                                        (vote) =>
                                            vote.userId === user.id &&
                                            vote.state === 'yellow'
                                    )
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'shadow-lg'
                                        }`}
                                    disabled={dayVotes[hoveredDay]?.votes?.some(
                                        (vote) => vote.userId === user.id && vote.state === 'yellow'
                                    )}
                                    onClick={() => handleVote('yellow')}>
                                    Quizá
                                </button>
                                <button
                                    className={`text-black bg-red-400 px-6 py-3 rounded hover:bg-red-600 transition duration-200
                            ${dayVotes[hoveredDay]?.votes?.some(
                                        (vote) =>
                                            vote.userId === user.id &&
                                            vote.state === 'none'
                                    )
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'shadow-lg'
                                        }`}
                                    disabled={dayVotes[hoveredDay]?.votes?.some(
                                        (vote) =>
                                            vote.userId === user.id &&
                                            (vote.state === 'none' || !vote.state)
                                    )}
                                    onClick={() => handleVote('none')}>
                                    No puedo
                                </button>
                            </div>

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
                                                className='w-10 h-10 rounded-full border-4 border-green-500 '
                                                style={{
                                                    backgroundImage: `url(${vote.avatar
                                                        ? vote.avatar === 'default-avatar.png'
                                                            ? '/default-avatar.png'
                                                            : vote.avatar.startsWith('http')
                                                                ? vote.avatar
                                                                : `https://cdn.discordapp.com/avatars/${vote.userId}/${vote.avatar}.png`
                                                        : '/default-avatar.png'
                                                        })`,
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
                                                className='w-10 h-10 rounded-full border-4 border-yellow-400 '
                                                style={{
                                                    backgroundImage: `url(${vote.avatar
                                                        ? vote.avatar === 'default-avatar.png'
                                                            ? '/default-avatar.png'
                                                            : vote.avatar.startsWith('http')
                                                                ? vote.avatar
                                                                : `https://cdn.discordapp.com/avatars/${vote.userId}/${vote.avatar}.png`
                                                        : '/default-avatar.png'
                                                        })`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}></div>
                                            <span className='ml-2 font-medium'>{vote.username}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <p className='text-gray-700 italic'>
                            Selecciona una fecha para ver los votos.
                        </p>
                    )}
                </div>
            </div>

            {/* CSS for responsiveness and scroll */}
            <style jsx>{`
        @media (max-width: 768px) {
          .md\\:w-1\\/2 {
            width: 100%;
          }
          .md\\:flex-row {
            flex-direction: column;
          }
          main {
            overflow-y: auto;
          }
          .overflow-auto {
            overflow-y: auto;
          }
        }

        .overflow-auto {
          overflow-y: auto;
        }
      `}</style>
        </main>
    );
};

export default CalendarComponent;
