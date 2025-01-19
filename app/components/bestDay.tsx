

type BestDayResponse = {
    bestDay: string;
    participants: string[];
};


const BestDayButton: React.FC = () => {
    const getBestDayForNextWeek = async () => {
        try {
            const response = await fetch("/api/best-day");

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data: BestDayResponse = await response.json();

            if (data.bestDay && data.participants) {
                // Format the participants list into a string
                console.log("Message sent correctly")
            } else {
                console.error("Error fetching the best day.");
            }
        } catch (error) {
            console.error("Error fetching best day:", error);
        }
    };

    return (
        <div className='m-5'>

            <button className="text-white bg-violet-900 px-4 py-2 rounded hover:bg-violet-950" onClick={getBestDayForNextWeek}>Mensaje!</button>

        </div>
    );
};

export default BestDayButton;
