import React, { useState } from 'react';

type BestDayResponse = {
    bestDay: string;
    participants: string[];
};

type BestDayState = {
    day: string;
    participants: string;
} | null;

const BestDayButton: React.FC = () => {
    const [bestDay, setBestDay] = useState<BestDayState>(null);

    const getBestDayForNextWeek = async () => {
        try {
            const response = await fetch("/api/best-day");

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data: BestDayResponse = await response.json();

            if (data.bestDay && data.participants) {
                // Format the participants list into a string
                const participantsList = data.participants.map((username) => `- ${username}`).join('\n');

                // Set the best day and participants
                setBestDay({
                    day: data.bestDay,
                    participants: participantsList,
                });
            } else {
                console.error("Error fetching the best day.");
            }
        } catch (error) {
            console.error("Error fetching best day:", error);
        }
    };

    return (
        <div>
            {!bestDay ? (
                <button onClick={getBestDayForNextWeek}>Find the Best Day to Play Next Week</button>
            ) : (
                <p>
                    The best day for playing is: {bestDay.day}
                    <br />
                    And there are these people available:
                    <pre>{bestDay.participants}</pre>
                </p>
            )}
        </div>
    );
};

export default BestDayButton;
