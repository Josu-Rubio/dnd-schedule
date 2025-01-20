// app/api/cron-task/route.ts
import { sendMessageToDiscord } from '../../utils/discordBot'; // Your existing function to send messages to Discord
import mongoose from 'mongoose';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';

// MongoDB connection setup
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI || '');
}

const DaySchema = new mongoose.Schema({
    date: { type: String, required: true },
    votes: [
        {
            userId: { type: String, required: true },
            username: { type: String, required: true },
            avatar: { type: String },
            state: { type: String, enum: ['green', 'yellow'], required: true },
        },
    ],
});

const DayModel = mongoose.models.Day || mongoose.model('Day', DaySchema);

export async function GET() {
    // Run your cron job logic here

    const today = new Date();
    const nextMonday = startOfWeek(addDays(today, 7), { weekStartsOn: 1 });
    const nextSunday = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
    const startOfNextWeek = format(nextMonday, 'yyyy-MM-dd');
    const endOfNextWeek = format(nextSunday, 'yyyy-MM-dd');

    const days = await DayModel.find({
        date: { $gte: startOfNextWeek, $lte: endOfNextWeek },
    });

    const scores = days.map((day) => {
        const greenVotes = day.votes.filter((vote: { state: string }) => vote.state === 'green').length;
        const yellowVotes = day.votes.filter((vote: { state: string }) => vote.state === 'yellow').length;
        const totalVotes = greenVotes * 1 + yellowVotes * 0.5;

        return { date: day.date, totalVotes, votes: day.votes };
    });

    // Check if any day has 4 people eligible to play
    const eligibleDay = scores.find((score) => score.totalVotes >= 4);
    if (eligibleDay) {
        // Send message with embed
        const participants = eligibleDay.votes.map((vote: { userId: string; username: string }) => `<@${vote.userId}>`);
        const embed = {
            title: 'People ready to play!',
            description: `The best day to play is: ${eligibleDay.date}`,
            color: 0x00FF00,
            fields: [{ name: 'Participants', value: participants.join('\n'), inline: false }],
        };
        const message = 'Here is the group ready to play!';
        await sendMessageToDiscord(message, embed);
    } else {
        console.log('eligibleDay', eligibleDay);
    }

    return new Response(JSON.stringify({ message: 'Cron job executed successfully' }), {
        status: 200,
    });
}
